create table if not exists public.category_settings (
  category text primary key,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.category_settings enable row level security;

create policy "Anyone can view category settings"
  on public.category_settings for select
  using (true);

create policy "Admins can manage category settings"
  on public.category_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed one row per existing product category
insert into public.category_settings (category)
select distinct category from public.products
on conflict (category) do nothing;
