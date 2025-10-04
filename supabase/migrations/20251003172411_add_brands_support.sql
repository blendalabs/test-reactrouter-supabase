-- =============================================
-- STEP 1: Create brands table
-- =============================================
create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- STEP 2: Add brand_id to templates
-- =============================================
alter table public.templates
add column if not exists brand_id uuid references public.brands (id);

-- Index for filtering by brand
create index if not exists templates_brand_id_idx on public.templates (brand_id);

-- =============================================
-- STEP 3: Enable RLS + policies for brands
-- =============================================
alter table public.brands enable row level security;

-- Anyone authenticated can read brands (needed for filtering dropdowns)
create policy "Authenticated users can view brands" on public.brands for
select to authenticated using (true);