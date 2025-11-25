-- Add store information to profiles table
alter table public.profiles
add column if not exists store_name text,
add column if not exists store_logo_url text,
add column if not exists store_slug text unique;

-- Add category to products table
alter table public.products
add column if not exists category text,
add column if not exists stock integer default 0;

-- Create orders table for tracking purchases
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  total_price decimal(10, 2) not null,
  payment_method text not null check (payment_method = 'cash'),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  buyer_name text not null,
  buyer_phone text not null,
  buyer_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for orders
alter table public.orders enable row level security;

-- Policies for orders
create policy "Users can view their own orders as buyer"
  on public.orders for select
  using (auth.uid() = buyer_id);

create policy "Sellers can view orders for their products"
  on public.orders for select
  using (auth.uid() = seller_id);

create policy "Buyers can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers can update order status"
  on public.orders for update
  using (auth.uid() = seller_id);

-- Create index for faster store slug lookups
create index if not exists profiles_store_slug_idx on public.profiles(store_slug);

-- Create index for product categories
create index if not exists products_category_idx on public.products(category);
