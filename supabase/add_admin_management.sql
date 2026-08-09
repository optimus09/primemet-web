-- Store email on profiles so the admin panel can show who's who without
-- needing access to the protected auth.users table.
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, contact_name, email)
  values (new.id, new.raw_user_meta_data ->> 'contact_name', new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Let admins promote/demote other users (previously admins could only view,
-- not update, other people's profiles).
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
