
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseQuery } from '@/hooks/supabase';

interface RequestAssignedToFieldProps {
  form: any;
}

const RequestAssignedToField: React.FC<RequestAssignedToFieldProps> = ({ form }) => {
  // Query staff members from profiles table
  const { data: staffMembers = [], isLoading } = useSupabaseQuery<any[]>(
    'profiles',
    {
      select: 'id, first_name, last_name, email',
    }
  );

  return (
    <FormField
      control={form.control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || "unassigned"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Select staff member"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.first_name || ''} {staff.last_name || ''} {staff.email ? `(${staff.email})` : ''}
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

export default RequestAssignedToField;
