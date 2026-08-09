-- Primemet platform schema
-- Run this once in Supabase SQL Editor (Project -> SQL Editor -> New query)

-- 1. Profiles (extends auth.users with role + company info)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  company_name text,
  contact_name text,
  phone text,
  address text,
  gst_number text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, contact_name)
  values (new.id, new.raw_user_meta_data ->> 'contact_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Products (spare parts & consumables catalog)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Welding Rods & Electrodes', 'Industrial Hardware & Fasteners', 'Machine Spares')),
  description text,
  unit_price numeric(12,2) not null default 0,
  unit text not null default 'piece',
  stock_quantity integer not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can manage products"
  on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 3. Scrap materials (reference list for the "sell your scrap" form)
create table if not exists public.scrap_materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true
);

alter table public.scrap_materials enable row level security;

create policy "Anyone can view scrap materials"
  on public.scrap_materials for select
  using (true);

create policy "Admins can manage scrap materials"
  on public.scrap_materials for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4. Orders (both spare-parts orders and scrap sell requests)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  order_type text not null check (order_type in ('spare_parts_order', 'scrap_sell_request')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'dispatched', 'completed', 'cancelled')),
  total_amount numeric(12,2),
  plant_location text,
  preferred_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Customers can view own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "Customers can insert own orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all orders"
  on public.orders for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5. Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  material_name text,
  quantity numeric(12,2) not null default 1,
  unit text not null default 'piece',
  price numeric(12,2),
  estimated_weight numeric(12,2)
);

alter table public.order_items enable row level security;

create policy "Customers can view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Customers can insert own order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Admins can view all order items"
  on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 6. Seed data: scrap materials
insert into public.scrap_materials (name, description) values
  ('MS Turnings', 'Mild steel turnings from machining operations'),
  ('HMS 1 & 2', 'Heavy melting scrap, grades 1 and 2'),
  ('Aluminium', 'Aluminium scrap, all grades'),
  ('Copper', 'Copper scrap including armature and wire'),
  ('SS 304 / 316', 'Stainless steel offcuts and scrap'),
  ('Brass & Alloys', 'Brass and mixed alloy scrap')
on conflict do nothing;

-- 7. Seed data: sample products
insert into public.products (name, category, description, unit_price, unit, stock_quantity, is_active) values
  ('E6013 Welding Electrode 3.15mm', 'Welding Rods & Electrodes', 'General purpose mild steel electrode, pack of 5kg', 650.00, 'pack', 120, true),
  ('E7018 Low Hydrogen Electrode 4mm', 'Welding Rods & Electrodes', 'Low hydrogen electrode for structural welding, pack of 5kg', 890.00, 'pack', 80, true),
  ('MIG Welding Wire ER70S-6 1.2mm', 'Welding Rods & Electrodes', '15kg spool, copper coated', 4200.00, 'spool', 40, true),
  ('Stainless Steel Welding Rod 308L', 'Welding Rods & Electrodes', 'For SS 304/316 fabrication, pack of 5kg', 1450.00, 'pack', 60, true),
  ('Hex Bolts M12x50 (Grade 8.8)', 'Industrial Hardware & Fasteners', 'Box of 100, zinc plated', 780.00, 'box', 200, true),
  ('Hex Nuts M12', 'Industrial Hardware & Fasteners', 'Box of 200, zinc plated', 320.00, 'box', 250, true),
  ('Flat Washers M12', 'Industrial Hardware & Fasteners', 'Box of 500', 210.00, 'box', 300, true),
  ('Anchor Fasteners 10mm', 'Industrial Hardware & Fasteners', 'Box of 50, heavy duty', 540.00, 'box', 150, true),
  ('U-Clamps 2 inch', 'Industrial Hardware & Fasteners', 'Box of 100, galvanized', 960.00, 'box', 90, true),
  ('Bearing 6205 ZZ', 'Machine Spares', 'Sealed deep groove ball bearing', 185.00, 'piece', 400, true),
  ('V-Belt A-Section 52 inch', 'Machine Spares', 'Rubber V-belt for industrial drives', 320.00, 'piece', 220, true),
  ('Motor Coupling Rubber Insert', 'Machine Spares', 'Flexible coupling spider insert, size L100', 450.00, 'piece', 100, true),
  ('Industrial Gate Valve 2 inch', 'Machine Spares', 'Cast iron, rated for industrial process lines', 2200.00, 'piece', 35, true),
  ('Pneumatic Cylinder 63mm Bore', 'Machine Spares', 'Double acting, 200mm stroke', 3100.00, 'piece', 25, true)
on conflict do nothing;
