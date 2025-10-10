CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE templates
ADD COLUMN brand_id INTEGER REFERENCES brands(id);

CREATE INDEX idx_templates_brand_id ON templates(brand_id);