
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  options: Array<{ value: string; label: string }>;
  width?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onValueChange,
  label,
  options,
  width = "w-[150px]"
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={width}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FilterSelect;
