
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResidentFormField } from './ResidentFormField';
import { FieldError } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface ResidentSelectFieldProps {
  id: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: FieldError;
}

export const ResidentSelectField: React.FC<ResidentSelectFieldProps> = ({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  error
}) => {
  return (
    <ResidentFormField id={id} label={label} error={error?.message}>
      <Select 
        defaultValue={value} 
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ResidentFormField>
  );
};
