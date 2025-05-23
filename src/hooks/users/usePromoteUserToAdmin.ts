
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePromoteUserToAdmin = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const promoteUserToAdmin = async (userId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [userId]: true }));
      
      console.log(`Promoting user ${userId} to admin role`);
      
      // Update the user's role in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) {
        console.error('Error promoting user to admin:', error);
        toast.error(`Failed to grant admin rights: ${error.message}`);
        throw error;
      }
      
      toast.success('Successfully granted admin rights');
      return true;
    } catch (err: any) {
      console.error('Unexpected error promoting user to admin:', err);
      toast.error(`Error: ${err.message}`);
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return {
    promoteUserToAdmin,
    isLoading
  };
};
