CREATE VIEW view_templates_with_brand AS
SELECT
  templates.id,
  templates.title AS template_name,
  brands.name AS brand_name,
  templates.brand_id
FROM
  templates
LEFT JOIN
  brands ON templates.brand_id = brands.id;