
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NewUserFormValues } from '../types';

interface PasswordFieldProps {
  form: UseFormReturn<NewUserFormValues>;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="••••••••" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
