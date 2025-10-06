import React from 'react';
import { useSearchParams } from 'react-router';
import { Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandFilterProps {
  // NOTE:
  // Getting brands as prop to follow projects principles of using loader
  // we could use useLoaderData here, but this way any one can understand that brands needed to be fetched in the loader
  // BTW form a component point of view, each component should be self-contained
  // there are too many things to consider in implementation based on the team and coding style,
  // but for this test task, I used this approach, to follow the loader principles and having complete SSR
  brands: Brand[];
}

export const BrandFilter: React.FC<BrandFilterProps> = ({ brands }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentBrand = searchParams.get('brand') || 'all';

  const handleBrandChange = (value: string) => {
    setSearchParams(prev => {
      if (value === 'all') {
        prev.delete('brand');
      } else {
        prev.set('brand', value);
      }
      return prev;
    });
  };

  return (
    <Select value={currentBrand} onValueChange={handleBrandChange}>
      <SelectTrigger className="w-[200px]">
        <Tag className="mr-2 h-4 w-4" />
        <SelectValue placeholder="All Brands" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Brands</SelectItem>
        {brands.map(brand => (
          <SelectItem key={brand.id} value={brand.slug}>
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
