-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'tag',
  color text not null default '#6366f1',
  type text not null check (type in ('expense', 'income', 'both')),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Users can manage their own categories"
  on categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CUSTOM FIELD DEFINITIONS
-- ============================================================
create table if not exists custom_field_definitions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  field_type text not null check (field_type in ('text', 'number', 'boolean', 'select')),
  options jsonb,
  applies_to text not null check (applies_to in ('expense', 'income', 'both')),
  is_required boolean not null default false,
  created_at timestamptz not null default now()
);

alter table custom_field_definitions enable row level security;

create policy "Users can manage their own custom field definitions"
  on custom_field_definitions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense', 'income')),
  amount numeric(14, 2) not null check (amount > 0),
  date date not null,
  category_id uuid references categories(id) on delete set null,
  detail text,
  note text,
  custom_fields jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "Users can manage their own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_transactions_updated_at
  before update on transactions
  for each row execute procedure update_updated_at_column();

-- ============================================================
-- FINANCIAL INCOMES
-- ============================================================
create table if not exists financial_incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table financial_incomes enable row level security;

create policy "Users can manage their own financial incomes"
  on financial_incomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FINANCIAL FIXED EXPENSES
-- ============================================================
create table if not exists financial_fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table financial_fixed_expenses enable row level security;

create policy "Users can manage their own financial fixed expenses"
  on financial_fixed_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FINANCIAL ASSETS
-- ============================================================
create table if not exists financial_assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  asset_type text not null check (asset_type in ('cash', 'investment', 'real_estate', 'vehicle', 'other')),
  value numeric(14, 2) not null default 0,
  monthly_income numeric(14, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table financial_assets enable row level security;

create policy "Users can manage their own financial assets"
  on financial_assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FINANCIAL LIABILITIES
-- ============================================================
create table if not exists financial_liabilities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  liability_type text not null check (liability_type in ('mortgage', 'car_loan', 'personal_loan', 'credit_card', 'other')),
  balance numeric(14, 2) not null default 0,
  monthly_payment numeric(14, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table financial_liabilities enable row level security;

create policy "Users can manage their own financial liabilities"
  on financial_liabilities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists transactions_user_id_date_idx on transactions(user_id, date desc);
create index if not exists transactions_user_id_type_idx on transactions(user_id, type);
create index if not exists transactions_category_id_idx on transactions(category_id);
create index if not exists categories_user_id_idx on categories(user_id);
