
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserWithProfile } from '@/types/user-types';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export const useProfileSync = (users: UserWithProfile[]) => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [authUserCount, setAuthUserCount] = useState(0);
  const [syncInfo, setSyncInfo] = useState<{
    totalAuthUsers: number;
    missingProfiles: number;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  
  // Check for missing profiles when users data changes
  useEffect(() => {
    const checkMissingProfiles = async () => {
      try {
        // Get all users from auth.users
        const { data, error } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 100 // Adjust based on expected user count
        });
        
        if (error) throw error;
        
        if (data && data.users) {
          const authUsers = data.users;
          setAuthUserCount(authUsers.length);
          
          // Create a set of existing profile IDs for fast lookup
          const existingProfileIds = new Set(users.map(user => user.id));
          
          // Find auth users without profiles
          const missingProfiles = authUsers.filter(
            (authUser: User) => !existingProfileIds.has(authUser.id)
          );
          
          setSyncInfo({
            totalAuthUsers: authUsers.length,
            missingProfiles: missingProfiles.length
          });
        }
      } catch (error) {
        console.error('Error checking for missing profiles:', error);
      }
    };
    
    checkMissingProfiles();
  }, [users]);
  
  // Function to sync missing profiles
  const syncMissingProfiles = async () => {
    if (syncInProgress) return;
    
    setSyncInProgress(true);
    setSyncResult(null);
    
    try {
      // Get all users from auth.users
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100
      });
      
      if (error) throw error;
      
      if (!data || !data.users || !data.users.length) {
        toast.error('No users found in the authentication system');
        setSyncInProgress(false);
        return;
      }
      
      const authUsers = data.users;
      
      // Create a set of existing profile IDs for fast lookup
      const existingProfileIds = new Set(users.map(user => user.id));
      
      // Find auth users without profiles
      const missingProfiles = authUsers.filter(
        (authUser: User) => !existingProfileIds.has(authUser.id)
      );
      
      if (missingProfiles.length === 0) {
        toast.success('All users already have profiles');
        setSyncInProgress(false);
        return;
      }
      
      let successCount = 0;
      let failedCount = 0;
      
      // Create profiles for users without them
      for (const authUser of missingProfiles) {
        try {
          // Extract user metadata if available
          const metadata = authUser.user_metadata || {};
          const firstName = metadata.first_name || '';
          const lastName = metadata.last_name || '';
          
          // Create a profile for this user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              first_name: firstName,
              last_name: lastName,
              role: 'user', // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error creating profile for ${authUser.email}:`, insertError);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing user ${authUser.email}:`, error);
          failedCount++;
        }
      }
      
      // Update sync results
      setSyncResult({
        success: successCount,
        failed: failedCount
      });
      
      // Show toast with results
      if (successCount > 0 && failedCount === 0) {
        toast.success(`Successfully created ${successCount} user profiles`);
      } else if (successCount > 0 && failedCount > 0) {
        toast.warning(`Created ${successCount} profiles, but ${failedCount} failed`);
      } else if (successCount === 0 && failedCount > 0) {
        toast.error(`Failed to create ${failedCount} profiles`);
      }
      
    } catch (error: any) {
      console.error('Error syncing profiles:', error);
      toast.error(`Error syncing profiles: ${error.message}`);
      setSyncResult({
        success: 0,
        failed: syncInfo?.missingProfiles || 0
      });
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
