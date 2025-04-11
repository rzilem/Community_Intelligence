
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface FormFieldTextareaProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  rows?: number;
}

const FormFieldTextarea = ({
  form,
  name,
  label,
  placeholder,
  rows = 5,
}: FormFieldTextareaProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea 
              placeholder={placeholder} 
              {...field} 
              rows={rows}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormFieldTextarea;
