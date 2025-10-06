import React from 'react';
import { useLoaderData } from 'react-router';
import Dropdown from '~/components/Dropdown';
import { requireAuthWithClient, ensureUserProfile } from '../lib/auth.server';

export async function loader({ request }: { request: Request }) {
  const { user, supabaseClient } = await requireAuthWithClient(request);

  // Ensure user has a profile
  try {
    await ensureUserProfile(user, request);
  } catch {
    // Ignore if profile already exists or not required
  }

  // Get brand-categories by slug
  const { data: brands, error: brandsError } = await supabaseClient
    .from('brand_categories')
    .select('id, brand_name');

  if (brandsError || !brands) {
    throw new Error('Brands not found');
  }

  return { user, brands: brands || [] };
}

export default function BrandSelector() {
  const { user, brands } = useLoaderData<typeof loader>();
  return (
    <div>
      <Dropdown brands={brands} />
    </div>
  );
}
