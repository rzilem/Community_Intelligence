
import React, { useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield, RefreshCw } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { UserWithProfile } from '@/types/user-types';
import UserManagement from '@/components/users/UserManagement';
import RolePermissionsCard from '@/components/users/RolePermissionsCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'resident', name: 'Resident' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'user', name: 'Basic User' },
];

const Permissions = () => {
  // Query directly from profiles table with more detailed logging
  const { data = [], isLoading, error, refetch } = useSupabaseQuery(
    'profiles', 
    {
      select: 'id, email, created_at, first_name, last_name, role, profile_image_url',
      filter: [],
      order: { column: 'created_at', ascending: false },
    }
  );
  
  // Log the raw data fetched from Supabase
  console.log('Permissions - Raw profiles data:', data);
  
  // Transform the profiles data to match the UserWithProfile structure
  const users = data.map(profile => ({
    id: profile.id,
    email: profile.email || '',
    created_at: profile.created_at,
    profile: {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      email: profile.email,
      profile_image_url: profile.profile_image_url
    }
  })) as UserWithProfile[];

  // Log the transformed users data
  console.log('Permissions - Transformed users:', users);

  // Function to sync Supabase auth users with profiles
  const syncMissingProfiles = async () => {
    try {
      toast.loading('Syncing user profiles...');
      
      // Use the new database function to sync missing profiles
      const { data: authData, error: authError } = await supabase.rpc('sync_missing_profiles');
      
      if (authError) {
        throw authError;
      }
      
      toast.success('User profiles synced successfully');
      refetch();
    } catch (err: any) {
      console.error('Error syncing profiles:', err);
      toast.error(`Failed to sync profiles: ${err.message}`);
    }
  };

  useEffect(() => {
    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users. Please try again.');
    }
  }, [error]);

  const handleRefresh = () => {
    console.log('Refreshing user list...');
    refetch();
  };

  return (
    <PageTemplate 
      title="User Permissions" 
      icon={<Shield className="h-8 w-8" />}
      description="Manage user roles and permissions across the platform."
      actions={
        <Button onClick={syncMissingProfiles} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Sync Missing Profiles
        </Button>
      }
    >
      <UserManagement 
        users={users} 
        isLoading={isLoading} 
        error={error} 
        roles={roles}
        onRefresh={handleRefresh} 
      />
      <RolePermissionsCard />
    </PageTemplate>
  );
};

export default Permissions;
