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
2. Put your real Telegram bot token, admin password, and domain in `.env`
3. Point your domain A record to your DigitalOcean droplet public IP
   - example: `admin.your-domain.kz -> YOUR_DROPLET_IP`
4. Run:
   - `docker compose up --build -d`
5. Open admin panel via domain:
   - `http://YOUR_DOMAIN`

## Nginx Reverse Proxy

- Nginx runs as `smart-order-nginx` in Docker Compose.
- It routes domain traffic on port 80 to the internal Streamlit admin service.
- Admin app is no longer published directly to host port 8501.

### Optional HTTPS (recommended)

- Keep this setup for now to verify domain routing.
- Then issue a TLS certificate (Let's Encrypt) and add 443 SSL config in Nginx.


## Project Structure

- `app/main.py` — aiogram bot + FSM + DB logic
- `dashboard/app.py` — Streamlit admin dashboard
- `Dockerfile` — container build
- `Dockerfile.dashboard` — admin panel container build
- `docker-compose.yml` — deployment stack
- `nginx/default.conf.template` — Nginx domain reverse-proxy config
- `ARCHITECTURE.md` — system layout for presentation
