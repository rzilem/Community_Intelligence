
import React from 'react';
import { Shield } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import UserManagement from '@/components/users/UserManagement';
import { useSupabaseQuery } from '@/hooks/supabase';
import { UserWithProfile } from '@/types/user-types';
import { toast } from 'sonner';

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'resident', name: 'Resident' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'user', name: 'Basic User' },
];

const Users = () => {
  const { data: users, isLoading, error, refetch } = useSupabaseQuery<UserWithProfile[]>(
    'profiles',
    {
      select: `
        id, 
        email, 
        created_at, 
        first_name, 
        last_name, 
        role, 
        profile_image_url,
        phone_number
      `,
      filter: [],
      order: { column: 'created_at', ascending: false },
    }
  );

  if (error) {
    toast.error('Error loading users');
  }

  return (
    <PageTemplate 
      title="User Management" 
      icon={<Shield className="h-8 w-8" />}
      description="Manage users and their roles across the platform."
    >
      <UserManagement 
        users={users || []} 
        isLoading={isLoading} 
        error={error} 
        roles={roles} 
        onRefresh={refetch}
      />
    </PageTemplate>
  );
};

export default Users;
