
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
  roles: { id: string; name: string }[];
}

const newUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  role: z.string().min(1, { message: 'Please select a role' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, onOpenChange, onUserCreated, roles }) => {
  const [loading, setLoading] = useState(false);

  const newUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      password: '',
    }
  });

  const createUser = async (formData: NewUserFormValues) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user && formData.role !== 'user') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: formData.role })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error('Error updating role:', updateError);
          toast.error(`User created, but role could not be set: ${updateError.message}`);
        }
      }
      
      toast.success('User created successfully');
      onOpenChange(false);
      newUserForm.reset();
      onUserCreated();
      
    } catch (err: any) {
      toast.error(`Error creating user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New User</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new user account. The user will receive an email confirmation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...newUserForm}>
          <form onSubmit={newUserForm.handleSubmit(createUser)} className="space-y-4">
            <FormField
              control={newUserForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={newUserForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={newUserForm.control}
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
            <FormField
              control={newUserForm.control}
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
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateUserDialog;
