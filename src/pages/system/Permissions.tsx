
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
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<UserWithProfile[]>(
    'users', 
    {
      select: '*, profile:profiles(*)',
      filter: [],
      order: { column: 'created_at', ascending: false },
    }
  );
  
  const users = data as UserWithProfile[];

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
