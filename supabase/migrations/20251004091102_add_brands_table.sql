-- Migration: Add brands table and link to templates
-- for filtering (e.g., ?brand=vio-ljusfabrik)

-- Create the brands table
-- I have presumed that Brands are simple labels/categories for organizing templates
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add brand_id column to templates table
-- This is nullable (optional) so templates can exist without being assigned to a brand
ALTER TABLE templates
  ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX idx_templates_brand_id ON templates(brand_id);

-- Enable Row Level Security on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Brands Policies
-- Note: Brands are global resources, not team-scoped
create policy "Authenticated users can view brands"
  on public.brands for select
  to authenticated
  using (true);

create policy "Authenticated users can insert brands"
  on public.brands for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update brands"
  on public.brands for update
  to authenticated
  using (true);

create policy "Authenticated users can delete brands"
  on public.brands for delete
  to authenticated
  using (true);

-- Create trigger for automatic updated_at
create trigger set_updated_at
  before update on public.brands
  for each row
  execute function public.handle_updated_at();
