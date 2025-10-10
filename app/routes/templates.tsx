import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

interface BrandSelectorProps {
  brands: { id: number; name: string }[];
  templates: { id: string; template_name: string; brand_name: string | null }[];
  brand: string | null;
}


export async function loader(args: LoaderFunctionArgs) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
  );
  const { searchParams } = new URL(args.request.url);
  const brand = searchParams.get("brand");

  const { data: brandsRaw } = await supabase.from("brands").select("*");

  console.log("brandsRaw:", brandsRaw); 

  
  const brands = brandsRaw ?? [];

  let query = supabase.from("view_templates_with_brand").select("*");
  if (brand) query = query.eq("brand_name", brand);
  const { data: templatesRaw } = await query;
  const templates = templatesRaw ?? [];

  return { brands, templates, brand };
}


export default function TemplatesPage() {
  const { brands = [], templates = [], brand = "" } = useLoaderData() as BrandSelectorProps;
  const [selectedBrand, setSelectedBrand] = useState(brand || "");

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelectedBrand(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("brand", value);
    else params.delete("brand");
    window.location.search = params.toString();
  }

  return (
    <div style={{ padding: 32 }}>
      <label style={{ fontWeight: "bold", marginRight: 8 }}>Brand:</label>
      <select value={selectedBrand} onChange={handleChange} style={{ padding: 8, fontSize: 16 }}>
        <option value="">All Brands</option>
        {brands.map(b => (
          <option key={b.id} value={b.name}>{b.name}</option>
        ))}
      </select>
      <hr style={{ margin: "24px 0" }} />
      <ul>
        {templates.map(t => (
          <li key={t.id}>
            <strong>{t.template_name}</strong>
            {t.brand_name ? ` (${t.brand_name})` : " (No Brand)"}
          </li>
        ))}
      </ul>
    </div>
  );
}