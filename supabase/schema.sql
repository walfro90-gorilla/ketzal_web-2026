-- Ketzal App - Core Schema
-- Run this in your Supabase SQL Editor

-- 1. PROFILES (Extends Auth Users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text default 'user' check (role in ('admin', 'provider', 'user', 'ambassador')),
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. SERVICES (Experience Catalog)
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text, -- Can be GeoJSON later
  price_mxn numeric default 0,
  available boolean default true,
  approved boolean default false, -- Admin moderation flag
  created_at timestamptz default now()
);

-- 3. WALLETS (Ketzal Financial System)
create table if not exists wallets (
  user_id uuid references profiles(id) on delete cascade primary key,
  balance numeric default 0,
  currency_code text default 'AXO', -- Axocoins
  updated_at timestamptz default now()
);

-- 4. TRANSACTIONS
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references wallets(user_id) not null,
  amount numeric not null,
  type text check (type in ('deposit', 'withdrawal', 'payment', 'refund')),
  reference_id text,
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table services enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;

-- Policies (Simplified for Initial Dev - TBD Strict Production Rules)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Services viewable by everyone" on services for select using (true);
create policy "Providers can insert services" on services for insert with check (auth.uid() = provider_id);
create policy "Providers can update own services" on services for update using (auth.uid() = provider_id);

-- WALLETS: Strict Privacy
create policy "Users can view own wallet" on wallets for select using (auth.uid() = user_id);
