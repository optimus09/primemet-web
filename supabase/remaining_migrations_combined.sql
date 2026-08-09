-- Site settings + visit tracking
create table if not exists public.site_settings (
  key text primary key, value boolean not null default true, updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Anyone can view site settings" on public.site_settings;
create policy "Anyone can view site settings" on public.site_settings for select using (true);
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.site_settings (key, value) values
  ('show_prices', true), ('show_scrap_rates', true), ('enable_bulk_pricing', true), ('enable_subscriptions', true)
on conflict (key) do nothing;

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(), path text not null, created_at timestamptz not null default now()
);
alter table public.site_visits enable row level security;
drop policy if exists "Anyone can log a visit" on public.site_visits;
create policy "Anyone can log a visit" on public.site_visits for insert with check (true);
drop policy if exists "Admins can view visits" on public.site_visits;
create policy "Admins can view visits" on public.site_visits for select using (public.is_admin());

-- Category visibility toggles
create table if not exists public.category_settings (
  category text primary key, is_visible boolean not null default true, updated_at timestamptz not null default now()
);
alter table public.category_settings enable row level security;
drop policy if exists "Anyone can view category settings" on public.category_settings;
create policy "Anyone can view category settings" on public.category_settings for select using (true);
drop policy if exists "Admins can manage category settings" on public.category_settings;
create policy "Admins can manage category settings" on public.category_settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.category_settings (category) select distinct category from public.products on conflict (category) do nothing;
