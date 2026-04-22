# Smart-Order Architecture

## Mermaid Diagram

```mermaid
flowchart LR
    U[Citizen / User] -->|Photo + GPS via Telegram| TG[Telegram Bot (aiogram 3.x)]
    TG --> BE[Python Backend (FSM + Business Logic)]
    BE --> DB[(SQLite incidents DB)]
    DB --> AD[Streamlit Admin Dashboard]
    AD -->|Status update / moderation| DB
    W[Web User / School Student] --> N[Nginx]
    N -->|/schools/| RQ[ENU RoboQuest (Node.js/Express)]
```

## Infrastructure Layout

- **DigitalOcean Droplet**: cloud VM hosting your full stack 24/7.
- **Docker**: packages Smart-Order into isolated containers with all dependencies.
- **Docker Compose**: runs and manages the bot service and persistent volume.
- **Nginx**: reverse proxy for web endpoints (e.g., Streamlit admin), TLS/SSL termination, and domain routing.
- **RoboQuest service**: separate Node.js/Express app for school quest scenarios, proxied via `/schools/`.
- **Data persistence**: SQLite file mounted as Docker volume (`smart_order_data`) so data survives container restarts.
