-- Allow any category text (real product list has 13+ categories, not just 3)
-- and add a SKU column for the real hardware trading catalog.
alter table public.products drop constraint if exists products_category_check;
alter table public.products add column if not exists sku text;
