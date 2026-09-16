create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

drop policy if exists "admins read products" on public.products;
create policy "admins read products" on public.products for select to authenticated using (public.is_admin() or is_active = true);
drop policy if exists "admins insert products" on public.products;
create policy "admins insert products" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "admins update products" on public.products;
create policy "admins update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete products" on public.products;
create policy "admins delete products" on public.products for delete to authenticated using (public.is_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read order items" on public.order_items;
create policy "admins read order items" on public.order_items for select to authenticated using (public.is_admin());
