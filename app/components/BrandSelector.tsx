import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { ChevronDown, Check, Tag } from 'lucide-react';
import type { Brand } from '~/types/global';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrandSlug: string | null;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({
  brands,
  selectedBrandSlug,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBrandFilter = (brandSlug: string | null) => {
    const newSearchParams = new globalThis.URLSearchParams(searchParams);
    if (brandSlug) {
      newSearchParams.set('brand', brandSlug);
    } else {
      newSearchParams.delete('brand');
    }
    setSearchParams(newSearchParams);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as globalThis.Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedBrand = brands.find(brand => brand.slug === selectedBrandSlug);
  const displayText = selectedBrand ? selectedBrand.name : 'All Brands';

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      {/* Filter Bar */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full justify-between bg-card hover:bg-accent border-border text-foreground rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{displayText}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {/* All Brands Option */}
            <button
              onClick={() => handleBrandFilter(null)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                selectedBrandSlug === null
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <span className="font-medium">All Brands</span>
              {selectedBrandSlug === null && <Check className="h-4 w-4" />}
            </button>

            {/* Brand Options */}
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => handleBrandFilter(brand.slug)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                  selectedBrandSlug === brand.slug
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{brand.name}</span>
                {selectedBrandSlug === brand.slug && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSelector;
