/* eslint-disable react/prop-types */
import { useSearchParams } from 'react-router';
import { Check, Tag } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import type { Brand } from '~/types/global';

interface BrandFilterProps {
  brands: Brand[];
}
const UNASSIGNED_FILTER = 'unassigned';

/**
 * Dropdown for selecting brands to filter templates.
 * Supports three states: All brands, Unassigned (no brand), or specific brand.
 * Updates URL search params to trigger filtering.
 */
export const BrandFilter: React.FC<BrandFilterProps> = ({ brands }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentBrand = searchParams.get('brand');

  // Set button text based on filter state
  const selectedBrandName = brands.find(b => b.slug === currentBrand)?.name;
  const displayText =
    currentBrand === UNASSIGNED_FILTER
      ? 'Unassigned'
      : selectedBrandName || 'All Brands';

  const handleBrandSelect = (brandSlug: string | null) => {
    if (brandSlug == null) {
      setSearchParams({});
    } else {
      setSearchParams({ brand: brandSlug });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="h-4 w-4" />
          {displayText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onSelect={() => handleBrandSelect(null)}>
          All Brands
          {!currentBrand && <Check className="h-4 w-4 mr-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleBrandSelect(UNASSIGNED_FILTER)}>
          Unassigned
          {currentBrand === UNASSIGNED_FILTER && (
            <Check className="h-4 w-4 mr-2" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {brands.map(brand => (
          <DropdownMenuItem
            key={brand.id}
            onSelect={() => handleBrandSelect(brand.slug)}
          >
            {brand.name}
            {currentBrand === brand.slug && <Check className="h-4 w-4 mr-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
