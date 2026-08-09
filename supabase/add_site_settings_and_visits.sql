-- Site-wide feature toggles, controllable from Admin > Settings
create table if not exists public.site_settings (
  key text primary key,
  value boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Anyone can view site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('show_prices', true),
  ('show_scrap_rates', true),
  ('enable_bulk_pricing', true),
  ('enable_subscriptions', true)
on conflict (key) do nothing;

-- Lightweight page-view tracking (no personal data, just path + timestamp)
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;

create policy "Anyone can log a visit"
  on public.site_visits for insert
  with check (true);

create policy "Admins can view visits"
  on public.site_visits for select
  using (public.is_admin());
