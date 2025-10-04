-- =============================================
-- Create view for templates with brand details
-- =============================================
create or replace view public.templates_with_brands as
select
  t.id,
  t.title,
  t.description,
  t.thumbnail_url,
  t.team_id,
  t.creator_user_id,
  t.created_at,
  t.updated_at,
  b.id as brand_id,
  b.slug as brand_slug,
  b.name as brand_name
from public.templates t
left join public.brands b on t.brand_id = b.id;
