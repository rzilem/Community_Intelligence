
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CreateUserForm } from './CreateUserForm';
import { useCreateUser } from './useCreateUser';
import { UserRole } from '@/types/profile-types';

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
  roles: { id: UserRole; name: string }[];
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onUserCreated, 
  roles 
}) => {
  const { loading, error, createUser, form } = useCreateUser(onOpenChange, onUserCreated);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New User</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new user account. The user will receive an email confirmation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <CreateUserForm 
          form={form} 
          loading={loading} 
          roles={roles}
          onSubmit={createUser}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateUserDialog;
