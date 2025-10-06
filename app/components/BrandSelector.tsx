import { Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { Brand } from '~/types/global';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: string | null;
  onBrandChange: (brandSlug: string | null) => void;
  className?: string;
}

export default function BrandSelector({
  brands,
  selectedBrand,
  onBrandChange,
  className,
}: BrandSelectorProps) {
  const handleBrandSelect = (value: string) => {
    onBrandChange(value === 'all' ? null : value);
  };

  return (
    <Select value={selectedBrand || 'all'} onValueChange={handleBrandSelect}>
      <SelectTrigger
        className={`w-fit bg-muted border-border ${className || ''}`}
        aria-label="Brand filter"
      >
        <Tag className="h-4 w-4" />
        <SelectValue placeholder="All Brands" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          value="all"
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        >
          All Brands
        </SelectItem>
        {brands.map(brand => (
          <SelectItem
            key={brand.id}
            value={brand.slug}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          >
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
