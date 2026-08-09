-- Let PostgREST embed profiles data on orders (e.g. orders.select("*, profiles(...)")).
-- orders.customer_id already references auth.users(id); profiles.id also equals
-- auth.users(id) 1:1, so adding this second FK lets PostgREST discover the join.
alter table public.orders
  add constraint orders_customer_id_profiles_fkey
  foreign key (customer_id) references public.profiles(id);
