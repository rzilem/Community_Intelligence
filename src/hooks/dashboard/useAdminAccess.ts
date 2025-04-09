
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminAccess(userId?: string) {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const ensureAdminAccess = async () => {
      if (!userId) return;
      
      try {
        setIsUpdatingRole(true);
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
          .select();

        if (error) {
          console.error('Error updating role:', error);
          setError(error);
        } else {
          console.log('User role updated to admin:', data);
          toast.success('Admin access granted successfully');
        }
      } catch (err) {
        console.error('Error ensuring admin access:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsUpdatingRole(false);
      }
    };

    ensureAdminAccess();
  }, [userId]);

  return { isUpdatingRole, error };
}
