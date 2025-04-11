
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
}

const FormFieldSelect = ({
  form,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
}: FormFieldSelectProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormFieldSelect;
