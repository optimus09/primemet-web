-- Fix: infinite recursion in RLS policies that check admin role by querying
-- profiles from within a policy on profiles (or on other tables in a way
-- that loops back through profiles' own recursive policy).
-- Run this once in the Supabase SQL Editor after the original schema.sql.

-- 1. Helper function: SECURITY DEFINER bypasses RLS, so checking role here
-- does not re-trigger the policies on profiles.
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

-- 2. Drop the recursive policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Anyone can view active products" on public.products;
drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Admins can manage scrap materials" on public.scrap_materials;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can update all orders" on public.orders;
drop policy if exists "Admins can view all order items" on public.order_items;

-- 3. Recreate them using the non-recursive helper function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage scrap materials"
  on public.scrap_materials for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin());

create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());
