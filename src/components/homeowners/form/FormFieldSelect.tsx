
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
}

interface FormFieldSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  options: Option[];
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
  required = true
}: FormFieldSelectProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {!required && <span className="text-muted-foreground ml-1 text-sm">(Optional)</span>}
          </FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {!required && (
                <SelectItem value="none">None Selected</SelectItem>
              )}
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
