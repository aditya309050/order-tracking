# Payload CMS 3.0 + Supabase PostgreSQL

This directory contains the complete **Payload CMS 3.0** configuration tailored for the Manufacturing & Order Tracking Pipeline.

---

## How It Works With Supabase

Payload CMS connects directly to your **Supabase PostgreSQL database** using the `postgresAdapter`.

```
                  ┌───────────────────────────────┐
                  │    Supabase Cloud Database    │
                  │         (PostgreSQL)          │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌────────────────────────┐      ┌─────────────────────────┐
    │  React Frontend App    │      │    Payload CMS (/admin) │
    │  (Vite on Vercel)      │      │    (Next.js on Vercel)  │
    │  - Office Admin (/office)      │    - Visual Schema Editor│
    │  - Warehouse Kanban    │      │    - User Role Management │
    │  - Client Portal       │      │    - Audit Logging        │
    └────────────────────────┘      └─────────────────────────┘
```

---

## Environment Variables Needed for Payload

Create a `.env` file in this directory with:

```env
# Supabase PostgreSQL Connection String (Found in Supabase Settings > Database > Connection string > URI)
DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Any random 32-character string for encryption
PAYLOAD_SECRET=your-random-secret-key-at-least-32-characters
```

---

## Collections Configured

1. **Orders (`/admin/collections/orders`)**:
   - Order Number (`ORD-1025`)
   - Client Company, Phone, Email
   - Client Portal Access ID & Password
   - Product, Category, Quantity, Dimensions, Design Notes
   - Live Status (Confirmed &rarr; In Process &rarr; Completed &rarr; Packed &rarr; Out for Delivery &rarr; Delivered)
   - Logistics details (Carrier driver, tracking code)
2. **Order Activities (`/admin/collections/order-activities`)**:
   - Immutable audit log tracking every stage transition and operator note.
3. **Users (`/admin/collections/users`)**:
   - Administrators (Office Admin, Warehouse Admin, Client).
