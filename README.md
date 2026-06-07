# Remindly

Scan-and-remind PWA for groceries, medicines, and cosmetics.

## Structure

```
remindly/
├── frontend/   React 19 + Vite + Tailwind v4 PWA
└── backend/    Spring Boot + JPA + Postgres + AWS SDK (Textract + S3) — not started yet
```

## Frontend

```sh
cd frontend
npm install
npm run dev
```

Dev server runs at http://localhost:5173 (or next free port).

## Backend

Not scaffolded yet. Planned: `POST /api/scan` (image → S3 → Textract → extracted fields), `POST /api/items` (persist), Postgres via JPA.

## Roadmap

See [Expiry_Tracking_PRD.pdf](../../Downloads/Expiry_Tracking_PRD.pdf). Currently between PRD §9 phases 2 (UX) and 3 (dev planning).
