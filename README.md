# Smart-Order (ENU Project)

Smart-Order is a Telegram-based civic reporting system inspired by **Taza Qazaqstan**, **Adal Azamat**, and **Law & Order** values.

## Features

- Citizen sends a problem photo
- Citizen shares GPS location
- Bot stores report in SQLite
- Bot returns a unique Ticket ID
- Placeholder hook for admin notification
- Streamlit admin panel with login, filters, metrics, CSV export, and status updates

## Quick Start

1. Copy env template:
   - `cp .env.example .env` (Linux/macOS)
   - `copy .env.example .env` (Windows)
2. Put your real Telegram bot token and admin password in `.env`
3. Run:
   - `docker compose up --build -d`
4. Open admin panel:
   - `http://YOUR_DROPLET_IP:8501`

## Project Structure

- `app/main.py` — aiogram bot + FSM + DB logic
- `dashboard/app.py` — Streamlit admin dashboard
- `Dockerfile` — container build
- `Dockerfile.dashboard` — admin panel container build
- `docker-compose.yml` — deployment stack
- `ARCHITECTURE.md` — system layout for presentation
