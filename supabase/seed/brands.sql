-- Insert brands
INSERT INTO public.brands
  (id, name, slug, team_id, created_at, updated_at)
VALUES 
  ('077a1bae-9012-4437-b9a4-ed413dab58d0', 'Lindells Bil', 'lindells-bil', '5e44edd3-df5d-4ff1-84f4-0ca7d7ba1704',  NOW(), NOW()),
  ('ab70ae18-5380-4769-a282-f320089f5599', 'Vio Ljusfabrik', 'vio-ljusfabrik', '5e44edd3-df5d-4ff1-84f4-0ca7d7ba1704',  NOW(), NOW());

-- Insert some more templates
INSERT INTO public.templates
  (id, title, description, team_id, creator_user_id, thumbnail_url, duration, created_at, updated_at)
VALUES 
  ('60dc7446-2010-4337-b8d2-31d7fdba3690', 'Template used for Lindells', 'Example product video', '5e44edd3-df5d-4ff1-84f4-0ca7d7ba1704', '813b6b64-f5f4-49ea-9719-c49db026d937', '/video_placeholder.svg', 12110, NOW(), NOW()),
  ('eb50e0e3-fa7b-48ba-a78b-b4050b1ba1b4', 'Template used for Vio', 'Example product video', '5e44edd3-df5d-4ff1-84f4-0ca7d7ba1704', '813b6b64-f5f4-49ea-9719-c49db026d937', '/video_placeholder.svg', 12110, NOW(), NOW()),
  ('136ab002-69d0-4f53-b2ef-d2c0dddf5c9d', 'Template used for both', 'Example product video', '5e44edd3-df5d-4ff1-84f4-0ca7d7ba1704', '813b6b64-f5f4-49ea-9719-c49db026d937', '/video_placeholder.svg', 12110, NOW(), NOW());

-- Insert many-to-many relations
INSERT INTO public.brand_template_relations
  (brand_id, template_id)
VALUES 
  ('077a1bae-9012-4437-b9a4-ed413dab58d0', '60dc7446-2010-4337-b8d2-31d7fdba3690'),
  ('ab70ae18-5380-4769-a282-f320089f5599', 'eb50e0e3-fa7b-48ba-a78b-b4050b1ba1b4'),
  ('077a1bae-9012-4437-b9a4-ed413dab58d0', '136ab002-69d0-4f53-b2ef-d2c0dddf5c9d'),
  ('ab70ae18-5380-4769-a282-f320089f5599', '136ab002-69d0-4f53-b2ef-d2c0dddf5c9d');

