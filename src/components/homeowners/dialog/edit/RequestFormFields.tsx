
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface RequestFormFieldsProps {
  form: UseFormReturn<any>;
}

const RequestFormFields: React.FC<RequestFormFieldsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea 
              {...field}
              placeholder="Add a note or comment..." 
              className="min-h-[80px] resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RequestFormFields;
