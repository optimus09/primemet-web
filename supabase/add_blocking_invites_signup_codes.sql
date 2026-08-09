-- 1. Customer blocking
alter table public.profiles add column if not exists is_blocked boolean not null default false;

-- 2. Admin invite by email: when someone signs up with an invited email,
-- they're automatically made admin instead of customer.
create table if not exists public.pending_admin_invites (
  email text primary key,
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.pending_admin_invites enable row level security;

drop policy if exists "Admins can manage invites" on public.pending_admin_invites;
create policy "Admins can manage invites"
  on public.pending_admin_invites for all
  using (public.is_admin())
  with check (public.is_admin());

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

-- 3. Invite-code gated signup
create table if not exists public.signup_codes (
  code text primary key,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.signup_codes enable row level security;

drop policy if exists "Admins can manage signup codes" on public.signup_codes;
create policy "Admins can manage signup codes"
  on public.signup_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- No public select policy on signup_codes (so codes can't be listed/enumerated).
-- Anyone can call this function to check ONE code without seeing the others.
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
