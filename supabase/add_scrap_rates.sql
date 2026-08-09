-- Live-ish scrap buying rates (admin-updatable), seeded from Vadodara market research
-- (scraprates.in, Aug 2026) with our buying price set ~7% below market for
-- negotiation margin.
create table if not exists public.scrap_rates (
  id uuid primary key default gen_random_uuid(),
  material_name text not null unique,
  market_price numeric(10,2) not null,
  our_price numeric(10,2) not null,
  unit text not null default 'kg',
  updated_at timestamptz not null default now()
);

alter table public.scrap_rates enable row level security;

create policy "Anyone can view scrap rates"
  on public.scrap_rates for select
  using (true);

create policy "Admins can manage scrap rates"
  on public.scrap_rates for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.scrap_rates (material_name, market_price, our_price) values
  ('MS Turnings', 32.72, 30.00),
  ('HMS 1 & 2', 30.00, 28.00),
  ('Aluminium', 151.75, 140.00),
  ('Copper', 591.54, 550.00),
  ('SS 304 / 316', 128.37, 118.00),
  ('Brass & Alloys', 404.60, 375.00)
on conflict (material_name) do nothing;
