-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ORDER TRACKING & PRODUCTION PIPELINE
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  client_access_id TEXT,
  client_password TEXT,
  product TEXT NOT NULL,
  category TEXT DEFAULT 'Hoardings',
  quantity INTEGER NOT NULL DEFAULT 1,
  dimensions TEXT,
  design_notes TEXT,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' 
    CHECK (status IN ('CONFIRMED', 'IN_PROCESS', 'COMPLETED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED')),
  priority TEXT DEFAULT 'NORMAL'
    CHECK (priority IN ('NORMAL', 'HIGH', 'URGENT')),
  assigned_to TEXT,
  delivery_driver TEXT,
  driver_phone TEXT,
  tracking_number TEXT,
  estimated_delivery TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Order Activities (Timeline / Custody Ledger)
CREATE TABLE IF NOT EXISTS public.order_activities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  status_from TEXT,
  status_to TEXT NOT NULL,
  note TEXT,
  actor_role TEXT DEFAULT 'WAREHOUSE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'CLIENT'
    CHECK (role IN ('OFFICE_ADMIN', 'WAREHOUSE_ADMIN', 'CLIENT')),
  client_access_id TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Orders Table
-- Public / Client can view orders by order_number or matching client_access_id
CREATE POLICY "Allow public order tracking lookup"
  ON public.orders
  FOR SELECT
  USING (true);

-- Anyone can insert orders (e.g. from office intake form)
CREATE POLICY "Allow order creation"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Anyone authenticated or staff can update status
CREATE POLICY "Allow order status updates"
  ON public.orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 7. RLS Policies for Order Activities
CREATE POLICY "Allow reading order activities"
  ON public.order_activities
  FOR SELECT
  USING (true);

CREATE POLICY "Allow appending order activities"
  ON public.order_activities
  FOR INSERT
  WITH CHECK (true);

-- 8. Enable Supabase Realtime for instant live status broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_activities;

-- 9. Seed Initial Demo Orders
INSERT INTO public.orders (
  order_number, client_name, client_phone, client_email, client_access_id, client_password,
  product, category, quantity, dimensions, design_notes,
  delivery_address, status, priority, assigned_to,
  delivery_driver, driver_phone, tracking_number, estimated_delivery
) VALUES 
(
  'ORD-1025', 'ABC Company', '+1 (555) 234-5678', 'procurement@abccompany.com', 'abc_client', 'abc123',
  'Hoardings', 'Hoardings', 20, '20ft x 10ft', 'High-resolution flex banner with anti-UV coating. Heavy metal grommets every 2ft.',
  '452 Industrial Parkway, Metro City, NY 10001', 'CONFIRMED', 'HIGH', NULL,
  NULL, NULL, NULL, '2026-09-15'
),
(
  'ORD-1024', 'Apex Retail Group', '+1 (555) 876-5432', 'storeops@apexretail.com', 'apex_client', 'apex123',
  '3D Acrylic LED Letters', 'Signage', 1, '8ft x 3ft', 'Warm white (3000K) LED backlight, black acrylic edges, frosted front diffusion plate.',
  '789 Market Street, Suite 4B, Boston, MA 02110', 'IN_PROCESS', 'NORMAL', 'CNC Team Alpha',
  NULL, NULL, NULL, '2026-09-13'
),
(
  'ORD-1021', 'Summit Fitness Clubs', '+1 (555) 765-4321', 'facilities@summitfitness.com', 'summit_client', 'summit123',
  'Pylon Wayfinding Totem', 'Displays', 2, '12ft high x 4ft wide', 'Structural steel internal cage with matte anthracite powder-coated panels.',
  '1200 Peakview Blvd, Denver, CO 80202', 'OUT_FOR_DELIVERY', 'HIGH', 'Heavy Logistics',
  'Carlos Mendoza (Van #8)', '+1 (555) 443-2211', 'TRK-MTR-8840', 'Today'
)
ON CONFLICT (order_number) DO NOTHING;

-- Seed initial activities
INSERT INTO public.order_activities (order_id, order_number, status_from, status_to, note, actor_role)
SELECT id, 'ORD-1025', NULL, 'CONFIRMED', 'Work order validated and confirmed by Office Admin', 'OFFICE'
FROM public.orders WHERE order_number = 'ORD-1025'
ON CONFLICT DO NOTHING;

INSERT INTO public.order_activities (order_id, order_number, status_from, status_to, note, actor_role)
SELECT id, 'ORD-1024', 'CONFIRMED', 'IN_PROCESS', 'Laser cutting underway in Warehouse Bay 3', 'WAREHOUSE'
FROM public.orders WHERE order_number = 'ORD-1024'
ON CONFLICT DO NOTHING;

INSERT INTO public.order_activities (order_id, order_number, status_from, status_to, note, actor_role)
SELECT id, 'ORD-1021', 'PACKED', 'OUT_FOR_DELIVERY', 'Dispatched with carrier Carlos Mendoza (Van #8)', 'LOGISTICS'
FROM public.orders WHERE order_number = 'ORD-1021'
ON CONFLICT DO NOTHING;
