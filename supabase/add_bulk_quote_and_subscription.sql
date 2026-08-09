-- Allow a new order_type for bulk pricing quote requests
alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders add constraint orders_order_type_check
  check (order_type in ('spare_parts_order', 'scrap_sell_request', 'bulk_quote_request'));

-- Scrap pickup subscription support
alter table public.orders add column if not exists is_subscription boolean not null default false;
alter table public.orders add column if not exists subscription_frequency text
  check (subscription_frequency in ('weekly', 'twice_monthly', 'monthly') or subscription_frequency is null);
