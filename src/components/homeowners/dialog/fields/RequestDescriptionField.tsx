
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface RequestDescriptionFieldProps {
  form: UseFormReturn<any>;
}

const RequestDescriptionField: React.FC<RequestDescriptionFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="h-full">
          <FormControl>
            <Textarea 
              {...field} 
              placeholder="Request description" 
              className="min-h-[200px] h-full resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RequestDescriptionField;
