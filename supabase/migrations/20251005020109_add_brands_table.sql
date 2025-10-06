-- =============================================
-- Add Brands Table and Update Templates
-- =============================================

-- Create Brands Table
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add brand_id to templates table
alter table public.templates 
add column brand_id uuid references public.brands(id) on delete set null;

-- =============================================
-- Create indexes
-- =============================================

-- Brands indexes
create index brands_name_idx on public.brands(name);

-- Templates brand_id index
create index templates_brand_id_idx on public.templates(brand_id);

-- =============================================
-- Enable Row Level Security
-- =============================================

alter table public.brands enable row level security;

-- =============================================
-- Create RLS Policies
-- =============================================

-- Brands Policies
create policy "Users can view all brands"
  on public.brands for select
  using (true);

-- =============================================
-- Create triggers for updated_at
-- =============================================

create trigger set_updated_at
  before update on public.brands
  for each row
  execute function public.handle_updated_at();
