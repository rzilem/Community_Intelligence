
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface RequestAssignedToFieldProps {
  form: UseFormReturn<any>;
}

const RequestAssignedToField: React.FC<RequestAssignedToFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="assignedTo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To (User ID)</FormLabel>
          <FormControl>
            <Input {...field} placeholder="User ID (optional)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RequestAssignedToField;
