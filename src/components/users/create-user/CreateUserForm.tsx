
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { NewUserFormValues } from './types';
import { EmailField } from './form-fields/EmailField';
import { NameFields } from './form-fields/NameFields';
import { PasswordField } from './form-fields/PasswordField';
import { RoleField } from './form-fields/RoleField';
import { UserRole } from '@/types/profile-types';

interface CreateUserFormProps {
  form: UseFormReturn<NewUserFormValues>;
  loading: boolean;
  roles: { id: UserRole; name: string }[];
  onSubmit: (data: NewUserFormValues) => Promise<void>;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ 
  form, 
  loading, 
  roles, 
  onSubmit 
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <EmailField form={form} />
        
        <NameFields form={form} />
        
        <PasswordField form={form} />
        
        <RoleField form={form} roles={roles} />
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : 'Create User'}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
};
