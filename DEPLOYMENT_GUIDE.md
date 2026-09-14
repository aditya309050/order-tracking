# Deployment Guide — Unified Next.js + Payload CMS

This project is now a **single Next.js 15 application** with Payload CMS 3
embedded, deployed as one Vercel project. There is no separate Vite client or
Express server anymore.

## Architecture

```
order-tracking/                 ← single deployable app (repo root)
  src/
    payload.config.ts           ← Payload config (Supabase Postgres + Vercel Blob)
    collections/                ← Orders, OrderActivities, Users, Media
    services/                   ← supabase.js, api.js, socket.js (browser data layer)
    context/                    ← AuthContext, UIContext
    components/                 ← Navbar, modals, StatusBadge, page components
    app/
      (app)/                    ← public + staff UI (React client components)
        /                       → login / landing
        /login                  → client & staff sign-in
        /overview               → operations dashboard
        /officeadmin            → office intake console
        /warehouseadmin         → shop-floor kanban
        /client                 → authenticated client portal
        /track, /track/[orderId]→ public order tracking
      (payload)/                ← Payload admin (/admin) + REST/GraphQL (/api)
  supabase/schema.sql           ← reference SQL for the raw tables
```

Data flow:
- **Front-end pages** read/write Supabase directly (`@supabase/supabase-js`) and
  subscribe to Supabase Realtime for live status updates.
- **Payload admin** (`/admin`) manages the same Postgres via `@payloadcms/db-postgres`.
- **File uploads** (Media collection) are stored in **Vercel Blob**.

## Vercel setup

1. **Root Directory:** `.` (repo root — the app is no longer under `cms/`).
2. **Build Command:** `next build` (default). **Install:** `npm install`.
3. **Environment variables:** copy from `.env.example`. Required:
   - `POSTGRES_URL_NON_POOLING` (and/or `POSTGRES_URL`)
   - `PAYLOAD_SECRET` (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - `BLOB_READ_WRITE_TOKEN`
4. Deploy. The app serves the UI, `/admin`, and `/api` from one domain.

## Database

The Supabase Postgres already contains: `orders`, `order_activities`, `users`,
`media`, and Payload's internal `payload_*` tables. Schema is currently managed
directly (Payload runs with `push: false` and no migration history), so **apply
future schema changes with SQL** in the Supabase SQL editor, or generate a
Payload migration in a disposable database first and port the SQL over.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000  (app + /admin + /api)
```

Without a Postgres connection string, Payload falls back to a local SQLite file
(`local-payload.db`) so the admin still boots for UI work.
