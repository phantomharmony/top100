# Smart-Order (ENU Project)

Smart-Order is a Telegram-based civic reporting system inspired by **Taza Qazaqstan**, **Adal Azamat**, and **Law & Order** values.

## Features

- Citizen sends a problem photo
- Citizen shares GPS location
- Citizen can switch language: EN / RU / KZ using `/language`
- Bot stores report in SQLite
- Bot returns a unique Ticket ID
- Placeholder hook for admin notification
- Streamlit admin panel with login, filters, metrics, CSV export, status updates
- Admin panel shows incident photo preview and geolocation map

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

- HTTPS is prepared with `certbot` service and shared certificate volumes.

#### Steps to enable HTTPS

1. Ensure DNS is ready:
   - `DOMAIN` points to your droplet IP.
2. Set email in `.env`:
   - `LETSENCRYPT_EMAIL=you@your-domain`
3. Start stack on HTTP first:
   - `docker compose up -d --build`
4. Issue certificate (one-time):
   - `docker compose run --rm smart-order-certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email $LETSENCRYPT_EMAIL --agree-tos --no-eff-email`
5. Enable SSL config:
   - In `docker-compose.yml`, replace mounted template
     `./nginx/default.conf.template` -> `./nginx/default-ssl.conf.template`
6. Restart Nginx:
   - `docker compose up -d smart-order-nginx`
7. Open:
   - `https://YOUR_DOMAIN`

`smart-order-certbot` auto-renews certificates every 12 hours.


## Project Structure

- `app/main.py` — aiogram bot + FSM + DB logic
- `dashboard/app.py` — Streamlit admin dashboard
- `Dockerfile` — container build
- `Dockerfile.dashboard` — admin panel container build
- `docker-compose.yml` — deployment stack
- `nginx/default.conf.template` — Nginx domain reverse-proxy config
- `ARCHITECTURE.md` — system layout for presentation
