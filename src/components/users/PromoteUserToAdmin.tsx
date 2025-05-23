
import React, { useEffect } from 'react';
import { usePromoteUserToAdmin } from '@/hooks/users/usePromoteUserToAdmin';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PromoteUserToAdminProps {
  email: string;
}

const PromoteUserToAdmin: React.FC<PromoteUserToAdminProps> = ({ email }) => {
  const { promoteUserToAdmin, isLoading } = usePromoteUserToAdmin();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [complete, setComplete] = React.useState<boolean>(false);

  // Find the user ID by email
  useEffect(() => {
    const findUserByEmail = async () => {
      try {
        // First, try to get the user from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', email)
          .single();

        if (profileData) {
          setUserId(profileData.id);
          // If user is already an admin, we're done
          if (profileData.role === 'admin') {
            toast.info(`${email} already has admin rights`);
            setComplete(true);
            return;
          }
        } else {
          // If not found in profiles, try to get from auth.users (as an admin)
          const { data, error } = await supabase.rpc('sync_missing_profiles');
          
          if (error) {
            console.error('Error syncing profiles:', error);
            toast.error(`Could not sync user profiles: ${error.message}`);
            return;
          }
          
          // Try again after syncing
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', email)
            .single();
            
          if (retryData) {
            setUserId(retryData.id);
            if (retryData.role === 'admin') {
              toast.info(`${email} already has admin rights`);
              setComplete(true);
              return;
            }
          } else {
            toast.error(`User with email ${email} not found`);
            return;
          }
        }
      } catch (err: any) {
        console.error('Error finding user by email:', err);
        toast.error(`Error finding user: ${err.message}`);
      }
    };

    findUserByEmail();
  }, [email]);

  // Promote user to admin when userId is found
  useEffect(() => {
    const promoteUser = async () => {
      if (userId && !complete) {
        const success = await promoteUserToAdmin(userId);
        if (success) {
          setComplete(true);
          toast.success(`Admin rights granted to ${email}`);
        }
      }
    };

    promoteUser();
  }, [userId, complete, promoteUserToAdmin, email]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-medium">Admin Rights Promotion</h3>
      {isLoading[userId || ''] ? (
        <p className="text-blue-600">Promoting {email} to admin...</p>
      ) : complete ? (
        <p className="text-green-600">{email} now has admin privileges</p>
      ) : (
        <p className="text-gray-600">Processing admin rights for {email}...</p>
      )}
    </div>
  );
};

export default PromoteUserToAdmin;
