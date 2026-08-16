-- ============================================================
-- PRIMEMET — FULL DATABASE SCHEMA (canonical, recreate-from-scratch)
-- Run this ONCE on a brand-new Supabase project to rebuild the
-- entire database exactly as it exists in production.
-- Safe to re-run (uses if-not-exists / drop-if-exists throughout).
-- ============================================================

-- ---------- 1. PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  company_name text,
  contact_name text,
  phone text,
  address text,
  gst_number text,
  email text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- SECURITY DEFINER helper — avoids infinite RLS recursion when checking admin role
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- ---------- 2. ADMIN INVITES (must exist before handle_new_user references it) ----------
create table if not exists public.pending_admin_invites (
  email text primary key,
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.pending_admin_invites enable row level security;

drop policy if exists "Admins can manage invites" on public.pending_admin_invites;
create policy "Admins can manage invites" on public.pending_admin_invites for all using (public.is_admin()) with check (public.is_admin());

-- Auto-create a profile row on signup; auto-promote to admin if the email was invited
create or replace function public.handle_new_user()
returns trigger as $$
declare
  invited boolean;
begin
  select exists(select 1 from public.pending_admin_invites where email = new.email) into invited;

  insert into public.profiles (id, contact_name, email, role)
  values (new.id, new.raw_user_meta_data ->> 'contact_name', new.email, case when invited then 'admin' else 'customer' end);

  if invited then
    delete from public.pending_admin_invites where email = new.email;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 3. PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text,
  name text not null,
  category text not null,
  description text,
  unit_price numeric(12,2) not null default 0,
  unit text not null default 'piece',
  stock_quantity integer not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
-- Note: category is free text (not a fixed check constraint) — real catalog has 13+ categories

alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products" on public.products for select using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 4. SCRAP MATERIALS (reference list for "Sell Your Scrap" form) ----------
create table if not exists public.scrap_materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  image_url text
);

alter table public.scrap_materials enable row level security;

drop policy if exists "Anyone can view scrap materials" on public.scrap_materials;
create policy "Anyone can view scrap materials" on public.scrap_materials for select using (true);

drop policy if exists "Admins can manage scrap materials" on public.scrap_materials;
create policy "Admins can manage scrap materials" on public.scrap_materials for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 5. ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  order_type text not null check (order_type in ('spare_parts_order', 'scrap_sell_request', 'bulk_quote_request')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'dispatched', 'completed', 'cancelled')),
  total_amount numeric(12,2),
  plant_location text,
  preferred_date date,
  notes text,
  is_subscription boolean not null default false,
  subscription_frequency text check (subscription_frequency in ('weekly', 'twice_monthly', 'monthly') or subscription_frequency is null),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Second FK so PostgREST can embed profiles on orders (orders.customer_id already
-- references auth.users; profiles.id is 1:1 with auth.users.id)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_customer_id_profiles_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_profiles_fkey
      foreign key (customer_id) references public.profiles(id);
  end if;
end $$;

alter table public.orders enable row level security;

drop policy if exists "Customers can view own orders" on public.orders;
create policy "Customers can view own orders" on public.orders for select using (auth.uid() = customer_id);

drop policy if exists "Customers can insert own orders" on public.orders;
create policy "Customers can insert own orders" on public.orders for insert with check (auth.uid() = customer_id);

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders for select using (public.is_admin());

drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders" on public.orders for update using (public.is_admin());

-- ---------- 6. ORDER ITEMS ----------
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

drop policy if exists "Customers can view own order items" on public.order_items;
create policy "Customers can view own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

drop policy if exists "Customers can insert own order items" on public.order_items;
create policy "Customers can insert own order items" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items" on public.order_items for select using (public.is_admin());

-- ---------- 7. SCRAP BUYING RATES ----------
create table if not exists public.scrap_rates (
  id uuid primary key default gen_random_uuid(),
  material_name text not null unique,
  market_price numeric(10,2) not null,
  our_price numeric(10,2) not null,
  unit text not null default 'kg',
  updated_at timestamptz not null default now()
);

alter table public.scrap_rates enable row level security;

drop policy if exists "Anyone can view scrap rates" on public.scrap_rates;
create policy "Anyone can view scrap rates" on public.scrap_rates for select using (true);

drop policy if exists "Admins can manage scrap rates" on public.scrap_rates;
create policy "Admins can manage scrap rates" on public.scrap_rates for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 8. SITE SETTINGS (admin on/off switches) ----------
create table if not exists public.site_settings (
  key text primary key,
  value boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can view site settings" on public.site_settings;
create policy "Anyone can view site settings" on public.site_settings for select using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('show_prices', true),
  ('show_scrap_rates', true),
  ('enable_bulk_pricing', true),
  ('enable_subscriptions', true),
  ('require_signup_code', false),
  ('show_stats', true),
  ('enable_ai_features', true)
on conflict (key) do nothing;

-- ---------- 8b. HOMEPAGE STATS (hero circle: 1 centre + up to 4 orbiting) ----------
create table if not exists public.homepage_stats (
  id uuid primary key default gen_random_uuid(),
  stat_value text not null,
  stat_label text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.homepage_stats enable row level security;

drop policy if exists "Anyone can view homepage stats" on public.homepage_stats;
create policy "Anyone can view homepage stats" on public.homepage_stats for select using (true);

drop policy if exists "Admins can manage homepage stats" on public.homepage_stats;
create policy "Admins can manage homepage stats" on public.homepage_stats for all using (public.is_admin()) with check (public.is_admin());

insert into public.homepage_stats (stat_value, stat_label, sort_order) values
  ('12,000 MT', 'Scrap handled every month', 1),
  ('98%', 'On-time lot lifting', 2)
on conflict do nothing;

-- ---------- 9. CATEGORY VISIBILITY TOGGLES ----------
create table if not exists public.category_settings (
  category text primary key,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.category_settings enable row level security;

drop policy if exists "Anyone can view category settings" on public.category_settings;
create policy "Anyone can view category settings" on public.category_settings for select using (true);

drop policy if exists "Admins can manage category settings" on public.category_settings;
create policy "Admins can manage category settings" on public.category_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.category_settings (category)
select distinct category from public.products
on conflict (category) do nothing;

-- ---------- 10. SITE VISIT TRACKING ----------
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;

drop policy if exists "Anyone can log a visit" on public.site_visits;
create policy "Anyone can log a visit" on public.site_visits for insert with check (true);

drop policy if exists "Admins can view visits" on public.site_visits;
create policy "Admins can view visits" on public.site_visits for select using (public.is_admin());

-- ---------- 11. SIGNUP INVITATION CODES ----------
create table if not exists public.signup_codes (
  code text primary key,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.signup_codes enable row level security;

drop policy if exists "Admins can manage signup codes" on public.signup_codes;
create policy "Admins can manage signup codes" on public.signup_codes for all using (public.is_admin()) with check (public.is_admin());

-- No public SELECT policy on signup_codes (codes must not be listable/enumerable).
-- This function lets the signup form check ONE code without exposing the table.
create or replace function public.is_valid_signup_code(input_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.signup_codes where code = input_code and is_active = true
  );
$$;

grant execute on function public.is_valid_signup_code(text) to anon, authenticated;

-- ---------- 12. SEED DATA ----------
insert into public.scrap_materials (name, description) values
  ('MS Turnings', 'Mild steel turnings from machining operations'),
  ('HMS 1 & 2', 'Heavy melting scrap, grades 1 and 2'),
  ('Aluminium', 'Aluminium scrap, all grades'),
  ('Copper', 'Copper scrap including armature and wire'),
  ('SS 304 / 316', 'Stainless steel offcuts and scrap'),
  ('Brass & Alloys', 'Brass and mixed alloy scrap')
on conflict do nothing;

insert into public.scrap_rates (material_name, market_price, our_price) values
  ('MS Turnings', 32.72, 30.00),
  ('HMS 1 & 2', 30.00, 28.00),
  ('Aluminium', 151.75, 140.00),
  ('Copper', 591.54, 550.00),
  ('SS 304 / 316', 128.37, 118.00),
  ('Brass & Alloys', 404.60, 375.00)
on conflict (material_name) do nothing;

-- Product catalog (78 real hardware/welding/tooling products) is loaded separately
-- from supabase/products_data.json — see PROJECT_DOCUMENTATION.md for how to
-- re-import it (or re-export it from the live products table).
