-- Wolf Materials Lab — procurement decision workflow schema

create extension if not exists "pgcrypto";

create table suppliers (
  id text primary key,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table products (
  id text primary key,
  code text not null unique,
  name text not null,
  unit text not null default 'unit',
  created_at timestamptz not null default now()
);

create table supplier_sources (
  id uuid primary key default gen_random_uuid(),
  supplier_id text not null references suppliers(id),
  filename text not null,
  version int not null,
  source_type text not null default 'csv',
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (supplier_id, content_hash)
);

create table supplier_offers (
  id uuid primary key default gen_random_uuid(),
  supplier_id text not null references suppliers(id),
  product_id text not null references products(id),
  source_id uuid not null references supplier_sources(id),
  source_row int not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price > 0),
  currency text not null default 'EUR',
  total_price numeric generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamptz not null default now()
);

create table decisions (
  id text primary key,
  product_id text not null references products(id),
  recommended_supplier_id text references suppliers(id),
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  currency text default 'EUR',
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'STALE', 'REJECTED')),
  current_version int not null default 0,
  approved_at timestamptz,
  approved_by text,
  source_id uuid references supplier_sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table decision_versions (
  id uuid primary key default gen_random_uuid(),
  decision_id text not null references decisions(id),
  version int not null,
  supplier_id text references suppliers(id),
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  currency text,
  status text not null,
  source_id uuid references supplier_sources(id),
  explanation text,
  created_at timestamptz not null default now(),
  unique (decision_id, version)
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  decision_id text not null references decisions(id),
  decision_version int not null,
  source_id uuid not null references supplier_sources(id),
  source_row int not null,
  field_name text not null,
  field_value text not null,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_key text not null unique,
  source_id uuid references supplier_sources(id),
  decision_id text references decisions(id),
  payload jsonb not null default '{}',
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  result jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  decision_id text not null references decisions(id),
  decision_version int not null,
  approved_by text not null,
  approved_at timestamptz not null default now(),
  status text not null default 'APPROVED' check (status in ('APPROVED', 'REJECTED'))
);

create index on supplier_offers (source_id);
create index on decision_versions (decision_id);
create index on evidence (decision_id);
create index on events (event_key);
create index on approvals (decision_id);

-- RLS on, no policies: only the server-side secret key (which bypasses RLS)
-- can read/write. No browser client access to these tables in this MVP.
alter table suppliers enable row level security;
alter table products enable row level security;
alter table supplier_sources enable row level security;
alter table supplier_offers enable row level security;
alter table decisions enable row level security;
alter table decision_versions enable row level security;
alter table evidence enable row level security;
alter table events enable row level security;
alter table approvals enable row level security;
