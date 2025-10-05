import React, { useState } from 'react';
import { ChevronDown, Tag, Check } from 'lucide-react';
import { useSearchParams } from 'react-router';

type Brand = {
  id: string;
  brand_name: string;
};

interface BrandDropdownProps {
  brands: Brand[];
}

const Dropdown: React.FC<BrandDropdownProps> = ({ brands }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<string>('All Brands');
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (brand: Brand): void => {
    setSelected(brand.brand_name);
    setOpen(false);

    setSearchParams({ brand: brand.brand_name });
  };

  return (
    <div className="relative inline-block w-48">
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span>{selected}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute mt-1 w-full rounded-[12px] border bg-white shadow-lg z-10">
          {brands.map(brand => (
            <div
              key={brand.id}
              onClick={() => handleSelect(brand)}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 
                hover:bg-gray-100 hover:text-black
                ${
                  selected === brand.brand_name
                    ? 'bg-[#8b0d2f] text-white'
                    : 'text-gray-700'
                }
              `}
            >
              <span>{brand.brand_name}</span>
              {selected === brand.brand_name && <Check className="w-5 h-5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
