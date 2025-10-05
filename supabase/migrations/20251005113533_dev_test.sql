-- Brand Categories Table
create table public.brand_categories (
  id uuid primary key,
  brand_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brand Categories indexes
create index brand_ctg_idx on public.brand_categories(brand_name);

-- Enable RLS Policy
alter table public.brand_categories enable row level security;

-- Create RLS Policy
create policy "Users can view all brand categories"
  on public.brand_categories for select
  using (true); 
