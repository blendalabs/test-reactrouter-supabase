// External imports
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Tag } from 'lucide-react';
import * as React from 'react';
import { useSearchParams } from 'react-router';

// Business logic
import type { Brand } from '~/types/global';

interface BrandSelectProps {
  brands: Pick<Brand, 'slug' | 'name'>[];
  activeBrand: string | null;
  label?: string;
}

const ALL = '__all__';

const BrandSelect: React.FC<BrandSelectProps> = ({
  brands,
  activeBrand,
  label = 'Filter by brand',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const options = React.useMemo(
    () => [{ slug: ALL, name: 'All Brands' }, ...brands],
    [brands]
  );

  const value = activeBrand ?? ALL;
  const displayText = options.find(o => o.slug === value)?.name ?? 'All Brands';

  const handleValueChange = (val: string) => {
    if (val === ALL) {
      searchParams.delete('brand');
    } else {
      searchParams.set('brand', val);
    }
    setSearchParams(searchParams, { replace: false });
  };

  // Don't render selector if no brands exist
  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="brand-select" className="text-sm text-muted-foreground">
        {label}
      </label>

      <Select.Root value={value} onValueChange={handleValueChange}>
        <Select.Trigger
          id="brand-select"
          aria-label={label}
          // removed focus ring & outline
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-background shadow-sm hover:bg-accent/10 outline-none focus:outline-none focus-visible:outline-none data-[state=open]:shadow-md"
        >
          <Tag className="h-4 w-4 opacity-80" />
          <Select.Value>{displayText}</Select.Value>
          <Select.Icon>
            <ChevronDown className="ml-2 h-4 w-4 opacity-80" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            // menu width = trigger width
            style={{ width: 'var(--radix-select-trigger-width)' }}
            className="z-50 overflow-hidden rounded-xl border bg-background shadow-xl outline-none"
            position="popper"
            sideOffset={8}
            align="start"
          >
            <Select.Viewport className="w-full p-1">
              {options.map(b => (
                <Select.Item
                  key={b.slug}
                  value={b.slug}
                  // removed outlines; keep hover and selected styles
                  className="
                    relative flex cursor-pointer items-center justify-between
                    rounded-md px-3 py-2 text-sm
                    outline-none focus:outline-none data-[highlighted]:outline-none
                    hover:bg-accent/20
                    data-[state=checked]:bg-red-700 data-[state=checked]:text-white
                  "
                >
                  <Select.ItemText>{b.name}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 text-black">
                    {/* tick color to black */}
                    <Check className="h-4 w-4 text-black" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default BrandSelect;
