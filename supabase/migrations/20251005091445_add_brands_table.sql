create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_brands_slug on public.brands(slug);

alter table public.brands enable row level security;

create policy "Users can view brands of their teams"
on public.brands for select
to authenticated
using (
  exists (
    select 1 from public.team_members
    where team_members.team_id = brands.team_id
    and team_members.user_id = auth.uid()
  )
);

create trigger set_updated_at
before update on public.brands
for each row
execute function public.handle_updated_at();

create table public.brand_template_relations (
  brand_id uuid not null references public.brands(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  primary key (brand_id, template_id)
);

alter table public.brand_template_relations enable row level security;

create policy "Users can view brand template relations of their teams"
on public.brand_template_relations for select
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    join public.brands b on tm.team_id = b.team_id
    where tm.user_id = auth.uid()
      and b.id = brand_template_relations.brand_id
  )
);
