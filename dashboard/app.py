import os
import sqlite3
import urllib.parse
import urllib.request
from json import loads
from datetime import datetime

import pandas as pd
import streamlit as st


DB_PATH = os.getenv("DB_PATH", "/data/smart_order.db")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
STATUS_OPTIONS = ["new", "in_progress", "resolved", "rejected"]


def _safe_ticket(row: pd.Series) -> str:
    incident_id = int(row["id"])
    raw_ts = str(row.get("timestamp", ""))
    try:
        dt = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
        date_part = dt.strftime("%Y%m%d")
    except Exception:
        date_part = datetime.utcnow().strftime("%Y%m%d")
    return f"SO-{date_part}-{incident_id:06d}"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def ensure_table() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                photo_id TEXT NOT NULL,
                lat REAL NOT NULL,
                lon REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                timestamp TEXT NOT NULL
            );
            """
        )


def fetch_incidents(status_filter: str) -> pd.DataFrame:
    ensure_table()
    query = """
        SELECT id, user_id, photo_id, lat, lon, status, timestamp
        FROM incidents
    """
    params: tuple = ()
    if status_filter != "all":
        query += " WHERE status = ?"
        params = (status_filter,)
    query += " ORDER BY id DESC"

    with get_connection() as conn:
        df = pd.read_sql_query(query, conn, params=params)

    if not df.empty:
        df.insert(0, "ticket_id", df.apply(_safe_ticket, axis=1))
    return df


def fetch_counts() -> dict:
    ensure_table()
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]
        new_count = conn.execute(
            "SELECT COUNT(*) FROM incidents WHERE status='new'"
        ).fetchone()[0]
        in_progress_count = conn.execute(
            "SELECT COUNT(*) FROM incidents WHERE status='in_progress'"
        ).fetchone()[0]
        resolved_count = conn.execute(
            "SELECT COUNT(*) FROM incidents WHERE status='resolved'"
        ).fetchone()[0]
    return {
        "total": total,
        "new": new_count,
        "in_progress": in_progress_count,
        "resolved": resolved_count,
    }


def update_status(incident_id: int, new_status: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE incidents SET status = ? WHERE id = ?",
            (new_status, incident_id),
        )
        conn.commit()


@st.cache_data(ttl=3600, show_spinner=False)
def resolve_telegram_photo_url(photo_id: str) -> str | None:
    if not BOT_TOKEN or not photo_id:
        return None

    get_file_url = (
        f"https://api.telegram.org/bot{BOT_TOKEN}/getFile?"
        f"file_id={urllib.parse.quote(photo_id)}"
    )
    try:
        with urllib.request.urlopen(get_file_url, timeout=10) as response:
            payload = loads(response.read().decode("utf-8"))
        if not payload.get("ok"):
            return None
        file_path = payload["result"]["file_path"]
        return f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
    except Exception:
        return None


def maps_link(lat: float, lon: float) -> str:
    return f"https://www.google.com/maps?q={lat},{lon}"


def require_login() -> None:
    if not ADMIN_PASSWORD:
        st.error("ADMIN_PASSWORD is not configured. Set it in environment variables.")
        st.stop()

    if "admin_auth" not in st.session_state:
        st.session_state.admin_auth = False

    if st.session_state.admin_auth:
        return

    st.subheader("Admin Login")
    password = st.text_input("Password", type="password")
    if st.button("Login", type="primary"):
        if password == ADMIN_PASSWORD:
            st.session_state.admin_auth = True
            st.rerun()
        else:
            st.error("Invalid password")
    st.stop()


def main() -> None:
    st.set_page_config(page_title="Smart-Order Admin", page_icon="🛡️", layout="wide")
    st.title("🛡️ Smart-Order Admin Dashboard")
    st.caption("Monitoring incidents for Taza Qazaqstan civic reporting")

    require_login()

    counts = fetch_counts()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total", counts["total"])
    c2.metric("New", counts["new"])
    c3.metric("In Progress", counts["in_progress"])
    c4.metric("Resolved", counts["resolved"])

    st.divider()

    left, right = st.columns([2, 1])
    with left:
        status_filter = st.selectbox(
            "Filter by status",
            options=["all", *STATUS_OPTIONS],
            index=0,
        )
    with right:
        refresh = st.button("Refresh")
        if refresh:
            st.rerun()

    incidents = fetch_incidents(status_filter)
    st.subheader("Incidents")

    if incidents.empty:
        st.info("No incidents found.")
    else:
        incidents["map_url"] = incidents.apply(
            lambda row: maps_link(float(row["lat"]), float(row["lon"])),
            axis=1,
        )
        st.dataframe(incidents, use_container_width=True, hide_index=True)
        csv_data = incidents.to_csv(index=False).encode("utf-8")
        st.download_button(
            "Download CSV",
            data=csv_data,
            file_name="smart_order_incidents.csv",
            mime="text/csv",
        )

        st.divider()
        st.subheader("Incident media & geolocation")
        view_id = st.selectbox("Select incident", options=incidents["id"].astype(int).tolist())
        selected = incidents[incidents["id"] == view_id].iloc[0]

        left_view, right_view = st.columns(2)
        with left_view:
            st.markdown(f"**Ticket:** {selected['ticket_id']}")
            photo_url = resolve_telegram_photo_url(str(selected["photo_id"]))
            if photo_url:
                st.image(photo_url, caption=f"Incident {view_id} photo", use_container_width=True)
            else:
                st.warning("Photo preview unavailable. Check BOT_TOKEN in admin service.")
                st.code(str(selected["photo_id"]))

        with right_view:
            lat = float(selected["lat"])
            lon = float(selected["lon"])
            st.markdown(f"**Coordinates:** {lat:.6f}, {lon:.6f}")
            st.map(pd.DataFrame([{"lat": lat, "lon": lon}]), use_container_width=True)
            st.markdown(f"[Open in Google Maps]({maps_link(lat, lon)})")

        st.divider()
        st.subheader("Update Incident Status")
        id_options = incidents["id"].astype(int).tolist()
        selected_id = st.selectbox("Incident ID", options=id_options)
        selected_status = st.selectbox("New status", options=STATUS_OPTIONS)
        if st.button("Apply status update", type="primary"):
            update_status(int(selected_id), selected_status)
            st.success(f"Incident {selected_id} updated to '{selected_status}'.")
            st.rerun()


if __name__ == "__main__":
    main()
