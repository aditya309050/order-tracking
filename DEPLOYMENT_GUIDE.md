# Complete Vercel, Supabase & Payload CMS Deployment Guide

This guide walks you step-by-step through deploying your **Enterprise Manufacturing & Order Tracking Pipeline** to **Vercel** with **Supabase (PostgreSQL + Realtime)** and connecting **Payload CMS**.

---

## 1. Local Run Commands (Development)

To run the system locally on your machine right now:

### Frontend (Client Portal & Admin Consoles)
```bash
cd c:\order-tracking\client
npm run dev
```
- **Local URL**: `http://localhost:3000`
- **Office Admin**: `http://localhost:3000/officeadmin` (or `/admin` or `/office`)
- **Warehouse Shop Floor**: `http://localhost:3000/warehouseadmin` (or `/warehouse`)
- **Client Tracking Portal**: `http://localhost:3000/client`
- **Public Waybill Lookup**: `http://localhost:3000/track/ORD-1025`

### Backend (Local Express + SQLite Server - for offline testing)
```bash
cd c:\order-tracking\server
npm run dev
```
- **Port**: `http://localhost:5000`

---

## 2. Setting Up Supabase (5 Minutes)

Supabase gives you a free remote PostgreSQL database, instant Realtime WebSockets, and Row-Level Security (RLS) so the app works seamlessly on Vercel without needing a persistent Node server.

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (Free).
2. Create a new organization and project (e.g. `order-tracking-manufacturing`).
3. Set a strong Database Password and note it down.
4. Once the project finishes initializing:
   - Open **SQL Editor** from the left navigation bar.
   - Open the file [`supabase/schema.sql`](file:///c:/order-tracking/supabase/schema.sql) in this workspace.
   - Copy its entire contents and paste into the Supabase SQL Editor.
   - Click **Run** (Ctrl+Enter / Cmd+Enter).
   - *This will instantly create the `orders`, `order_activities`, and `profiles` tables, enable Row-Level Security, enable Supabase Realtime, and seed initial demo work orders (`ORD-1025`, `ORD-1024`, `ORD-1021`).*
5. Retrieve your API credentials:
   - In your Supabase project dashboard, click **Project Settings** (gear icon) &rarr; **API**.
   - Copy **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy **anon public API Key** (`eyJhbGciOi...`).

---

## 3. Deploying Frontend to Vercel (1-Click)

1. Push this project to GitHub (or GitLab/Bitbucket):
   ```bash
   git add .
   git commit -m "Configure Supabase and Vercel deployment"
   git push origin main
   ```
2. Open [https://vercel.com](https://vercel.com) and log in.
3. Click **Add New...** &rarr; **Project**.
4. Import your GitHub repository.
5. In the Vercel project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (or `./` if deploying from workspace root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
7. Click **Deploy**.
8. In under 60 seconds, your site is live with an SSL certificate (`https://your-app.vercel.app`)!

---

## 4. Connecting Payload CMS 3.0 (Optional)

If you want Payload CMS's editorial admin panel (`/admin`) alongside your custom consoles:

1. Look in the [`cms/`](file:///c:/order-tracking/cms) directory.
2. The collections are pre-configured in:
   - [`cms/src/collections/Orders.ts`](file:///c:/order-tracking/cms/src/collections/Orders.ts)
   - [`cms/src/collections/OrderActivities.ts`](file:///c:/order-tracking/cms/src/collections/OrderActivities.ts)
   - [`cms/src/collections/Users.ts`](file:///c:/order-tracking/cms/src/collections/Users.ts)
3. To connect Payload to your Supabase PostgreSQL:
   - Go to Supabase **Project Settings** &rarr; **Database**.
   - Under **Connection string**, select **URI**.
   - Copy the URI: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
   - Set `DATABASE_URI` in `cms/.env` or in Vercel.

---

## 5. Security & Access Summary

| Role | Allowed URLs | Default Credentials | Behavior |
| :--- | :--- | :--- | :--- |
| **Office Admin** | `/officeadmin`, `/office`, `/` | `office` / `office123` | Can create orders, generate Client Portal ID & Password, view full pipeline. |
| **Warehouse Ops** | `/warehouseadmin`, `/warehouse` | `warehouse` / `warehouse123` | Shop floor Kanban board, advance statuses (`Route to Floor`, `QC Pass`, `Dispatch`). |
| **Client Portal** | `/client` | E.g. `abc_client` / `abc123` | **Strictly isolated**: Client sees *only* their own order(s), real-time stepper, carrier details. |
| **Public Tracking**| `/track/:orderId` | None required | Direct waybill lookup (e.g. `ORD-1025`). |
