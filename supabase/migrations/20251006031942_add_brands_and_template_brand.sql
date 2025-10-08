-- =============================================
-- STEP 1: Create brands table
-- =============================================

create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Updated_at trigger
create trigger set_updated_at
  before update on public.brands
  for each row
  execute function public.handle_updated_at();

-- =============================================
-- STEP 2: Add brand_id to templates table
-- =============================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'templates'
      and column_name = 'brand_id'
  ) then
    alter table public.templates
      add column brand_id uuid references public.brands(id) on delete set null;
    create index if not exists templates_brand_id_idx on public.templates(brand_id);
  end if;
end $$;

-- =============================================
-- STEP 3: Create view for templates with brands
-- =============================================

drop view if exists public.view_templates_with_brands;

create view public.view_templates_with_brands as
select
  t.*,
  b.name as brand_name,
  b.slug as brand_slug
from public.templates t
left join public.brands b on b.id = t.brand_id;

-- =============================================
-- STEP 4: Enable RLS and policy
-- =============================================

alter table public.brands enable row level security;

create policy "Authenticated users can view brands"
  on public.brands for select
  to authenticated
  using (true);
