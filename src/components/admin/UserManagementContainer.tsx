
import React from 'react';
import { UserWithProfile } from '@/types/user-types';
import { UserRole } from '@/types/profile-types';
import UserManagement from '@/components/users/UserManagement';

// Mock users data for now - this would typically come from a database query
const mockUsers: UserWithProfile[] = [
  {
    id: '1',
    email: 'admin@example.com',
    created_at: new Date().toISOString(),
    profile: {
      id: '1',
      email: 'admin@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'admin' as const,
      phone_number: null,
      preferred_language: 'en',
      profile_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    email: 'manager@example.com',
    created_at: new Date().toISOString(),
    profile: {
      id: '2',
      email: 'manager@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'manager' as const,
      phone_number: null,
      preferred_language: 'en',
      profile_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

const roles = [
  { id: 'admin' as UserRole, name: 'Administrator' },
  { id: 'manager' as UserRole, name: 'Manager' },
  { id: 'resident' as UserRole, name: 'Resident' },
  { id: 'maintenance' as UserRole, name: 'Maintenance' },
  { id: 'accountant' as UserRole, name: 'Accountant' },
  { id: 'treasurer' as UserRole, name: 'Treasurer' },
  { id: 'user' as UserRole, name: 'Basic User' },
];

const UserManagementContainer: React.FC = () => {
  const handleRefresh = () => {
    console.log('Refreshing users...');
  };

  return (
    <UserManagement 
      users={mockUsers}
      isLoading={false}
      error={null}
      roles={roles}
      onRefresh={handleRefresh}
    />
  );
};

export default UserManagementContainer;
