
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserWithProfile } from '@/types/user-types';

export const useProfileSync = (users: UserWithProfile[]) => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; created_count: number } | null>(null);
  const [authUserCount, setAuthUserCount] = useState<number | null>(null);
  const [syncInfo, setSyncInfo] = useState<string | null>(null);

  // Get auth user count for comparison with profiles
  useEffect(() => {
    const fetchAuthUserCount = async () => {
      try {
        // Use a direct query to get the count of auth users with proper typing
        const { data, error } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching auth user count:', error);
          return;
        }
        
        // The count comes back as a string but we need it as a number
        const totalUsers = data ? parseInt(data as unknown as string) : 0;
        setAuthUserCount(totalUsers);
        
        // If profiles count is less than auth users, show info message
        if (totalUsers > users.length) {
          setSyncInfo(`There are ${totalUsers} registered users but only ${users.length} user profiles. 
            Click "Sync Missing Profiles" to create the missing profiles.`);
        } else {
          setSyncInfo(null);
        }
      } catch (err) {
        console.error('Error in fetchAuthUserCount:', err);
      }
    };
    
    if (users.length >= 0) {
      fetchAuthUserCount();
    }
  }, [users]);

  // Function to sync Supabase auth users with profiles
  const syncMissingProfiles = async () => {
    try {
      setSyncInProgress(true);
      toast.loading('Syncing user profiles...');
      
      // Use the database function to sync missing profiles
      const { data: authData, error: authError } = await supabase.rpc('sync_missing_profiles');
      
      if (authError) {
        throw authError;
      }
      
      console.log('Sync profiles result:', authData);
      
      // Cast the data to the expected type
      const typedData = authData as { success: boolean; created_count: number };
      setSyncResult(typedData);
      
      if (typedData.created_count > 0) {
        toast.success(`User profiles synced successfully. Created ${typedData.created_count} new profiles.`);
        setSyncInfo(null);
      } else {
        toast.info('All users already have profiles. No new profiles were created.');
      }
    } catch (err: any) {
      console.error('Error syncing profiles:', err);
      toast.error(`Failed to sync profiles: ${err.message}`);
    } finally {
      setSyncInProgress(false);
    }
  };

  return {
    syncInProgress,
    syncResult,
    authUserCount,
    syncInfo,
    syncMissingProfiles
  };
};
