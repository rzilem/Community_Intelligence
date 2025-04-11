
import React from 'react';
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

interface FormFieldCheckboxProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
}

const FormFieldCheckbox = ({
  form,
  name,
  label,
  description,
}: FormFieldCheckboxProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && (
              <FormDescription>{description}</FormDescription>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default FormFieldCheckbox;
