
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NewUserFormValues, newUserSchema } from './types';

export function useCreateUser(
  onOpenChange: (open: boolean) => void, 
  onUserCreated: () => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewUserFormValues>({
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
      setError(null);
      
      console.log('Creating user with data:', { 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName,
        role: formData.role 
      });
      
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
      
      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        if (formData.role !== 'user') {
          console.log('Setting user role to:', formData.role);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: formData.role,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error('Error updating role:', updateError);
            toast.error(`User created, but role could not be set: ${updateError.message}`);
          }
        }
        
        toast.success(`User created successfully. Confirmation email sent to ${formData.email}`);
        onOpenChange(false);
        form.reset();
        
        // Force a refresh of the user list
        setTimeout(() => {
          onUserCreated();
        }, 500);
      } else {
        toast.error('User could not be created. No user ID returned.');
      }
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'An unknown error occurred');
      toast.error(`Error creating user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createUser, form };
}
