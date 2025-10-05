import { useSearchParams } from 'react-router';
import type { JSX } from 'react';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface SelectorSearchParamsProps {
  items: {
    title: string;
    value: string;
  }[];
  searchParamsKey: string;
  allItemsTitle?: string;
  defaultValue?: string;
  icon?: JSX.Element;
}

export const SelectorSearchParams: React.FC<SelectorSearchParamsProps> = ({
  items,
  allItemsTitle,
  defaultValue,
  searchParamsKey,
  icon,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = (value: string) => {
    if (value === 'all') {
      setSearchParams(search => {
        search.delete(searchParamsKey);
        return search;
      });
    } else {
      setSearchParams(search => {
        search.set(searchParamsKey, value);
        return search;
      });
    }
  };

  const selectedValue = searchParams.get(searchParamsKey);

  return (
    <Select
      defaultValue={selectedValue || defaultValue || 'all'}
      onValueChange={handleSelect}
    >
      <SelectTrigger>
        {icon}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allItemsTitle || 'All'}</SelectItem>
        {items.map(item => (
          <SelectItem value={item.value} key={item.value}>
            {item.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
