
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { UserWithProfile } from '@/types/user-types';
import UserManagement from '@/components/users/UserManagement';
import RolePermissionsCard from '@/components/users/RolePermissionsCard';

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'resident', name: 'Resident' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'user', name: 'Basic User' },
];

const Permissions = () => {
  // Query directly from profiles table
  const { data = [], isLoading, error, refetch } = useSupabaseQuery(
    'profiles', 
    {
      select: 'id, email, created_at, first_name, last_name, role, profile_image_url',
      filter: [],
      order: { column: 'created_at', ascending: false },
    }
  );
  
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

  return (
    <PageTemplate 
      title="User Permissions" 
      icon={<Shield className="h-8 w-8" />}
      description="Manage user roles and permissions across the platform."
    >
      <UserManagement 
        users={users} 
        isLoading={isLoading} 
        error={error} 
        roles={roles}
        onRefresh={refetch} 
      />
      <RolePermissionsCard />
    </PageTemplate>
  );
};

export default Permissions;
