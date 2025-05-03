
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewUserFormValues } from '@/components/users/create-user/types';
import { UserRole } from '@/types/profile-types';

interface RoleFieldProps {
  form: UseFormReturn<NewUserFormValues>;
  roles: { id: UserRole; name: string }[];
}

export const RoleField: React.FC<RoleFieldProps> = ({ form, roles }) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
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
