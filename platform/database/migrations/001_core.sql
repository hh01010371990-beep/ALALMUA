create extension if not exists "pgcrypto";

create type user_role as enum (
  'SUPER_ADMIN','CEO','OPERATIONS_MANAGER','SALES_MANAGER','SALES_AGENT',
  'MARKETING_MANAGER','CONTENT_MANAGER','TECHNICIAN','AI_MANAGER','SELLER','CUSTOMER'
);

create type seller_type as enum (
  'AL_HAZEM_OFFICIAL','OFFICIAL_BRAND','AUTHORIZED_DEALER','MARKETPLACE_SELLER','SERVICE_PROVIDER'
);

create type seller_status as enum (
  'PENDING','UNDER_REVIEW','APPROVED','SUSPENDED','REJECTED','ARCHIVED'
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid references brands(id),
  category_id uuid references categories(id),
  description text,
  width_cm numeric,
  height_cm numeric,
  depth_cm numeric,
  electricity_consumption numeric,
  warranty_months integer,
  has_3d_model boolean not null default false,
  has_ar_model boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  specification_key text not null,
  specification_value text not null
);

create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  media_type text not null,
  url text not null,
  alt_text text
);

create table if not exists product_3d_models (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references products(id) on delete cascade,
  model_3d_url text,
  model_ar_url text,
  installation_clearance text,
  wall_mount_required boolean not null default false,
  compatibility_rules jsonb not null default '{}'::jsonb
);

create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  business_name text not null,
  seller_type seller_type not null,
  status seller_status not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text
);

create table if not exists seller_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  seller_id uuid not null references sellers(id) on delete cascade,
  store_id uuid references stores(id),
  price numeric not null,
  compare_at_price numeric,
  stock_quantity integer not null default 0,
  warranty_months integer,
  delivery_days integer,
  created_at timestamptz not null default now(),
  unique(product_id, seller_id)
);

create table if not exists virtual_homes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists virtual_rooms (
  id uuid primary key default gen_random_uuid(),
  virtual_home_id uuid not null references virtual_homes(id) on delete cascade,
  room_type text not null,
  width_cm numeric,
  length_cm numeric,
  height_cm numeric,
  doors jsonb not null default '[]'::jsonb,
  windows jsonb not null default '[]'::jsonb
);

create table if not exists virtual_room_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references virtual_rooms(id) on delete cascade,
  product_id uuid not null references products(id),
  position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  rotation jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  scale jsonb not null default '{"x":1,"y":1,"z":1}'::jsonb
);

create table if not exists ai_agents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  system_prompt text not null,
  knowledge_scope jsonb not null default '[]'::jsonb,
  allowed_actions jsonb not null default '[]'::jsonb,
  handoff_rules jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  agent_id uuid references ai_agents(id),
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table seller_offers enable row level security;
alter table sellers enable row level security;

create policy "public can read products"
on products for select using (true);

create policy "public can read offers"
on seller_offers for select using (true);

create policy "users read own profile"
on profiles for select using (auth.uid() = id);