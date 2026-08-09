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
  ('250+', 'Manufacturing plants served', 1),
  ('12,000 MT', 'Scrap handled every month', 2),
  ('98%', 'On-time lot lifting', 3)
on conflict do nothing;

insert into public.site_settings (key, value) values ('show_stats', true)
on conflict (key) do nothing;
