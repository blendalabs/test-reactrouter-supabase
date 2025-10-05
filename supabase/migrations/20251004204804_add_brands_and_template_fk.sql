-- brands table ; a simple entity that we can attach to templates and filter by
create table if not exists public.brands (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null check (length(name) > 0),
  slug       text not null unique,                                   -- url-safe identifier (e.x., "blenda-labs")
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint brands_slug_lower check (slug = lower(slug))            -- keep slugs lowercase to avoids duplicates
);

-- keep updated_at using the existing trigger function
drop trigger if exists set_updated_at on public.brands;
create trigger set_updated_at
  before update on public.brands
  for each row
  execute function public.handle_updated_at();

-- quick lookup by slug as index can speed speedup the lookups)
create index if not exists brands_slug_idx on public.brands(slug);

-- adding brand_id FK on templates table that references brands(id)
-- this helps to associate each template with zero or one brand.
alter table public.templates
  add column if not exists brand_id uuid
  references public.brands(id) on delete set null;                   -- if delete brand then keep template, just null out brand field

create index if not exists templates_brand_id_idx on public.templates(brand_id);

-- row level security (rls)
-- brands should be readable to signed-in users
alter table public.brands enable row level security;

drop policy if exists "brands read for authenticated" on public.brands;
create policy "brands read for authenticated"
on public.brands
for select
to authenticated
using (true);