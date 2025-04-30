
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const FilterSearchInput = ({ value, onChange }: FilterSearchInputProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search requests..."
        className="pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default FilterSearchInput;
