
import React, { useState, useEffect } from 'react';
import UserManagement from '@/components/users/UserManagement';
import { UserWithProfile } from '@/types/user-types';
import { UserRole } from '@/types/profile-types';

const UserManagementContainer: React.FC = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const roles = [
    { id: 'admin' as UserRole, name: 'Administrator' },
    { id: 'manager' as UserRole, name: 'Manager' },
    { id: 'resident' as UserRole, name: 'Resident' },
    { id: 'maintenance' as UserRole, name: 'Maintenance' },
    { id: 'accountant' as UserRole, name: 'Accountant' }
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Mock data for now since we don't have actual user data
      const mockUsers: UserWithProfile[] = [
        {
          id: 'demo-user-1',
          email: 'admin@example.com',
          profile: {
            id: 'demo-user-1',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            phone_number: null,
            preferred_language: 'en',
            profile_image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        {
          id: 'demo-user-2',
          email: 'manager@example.com',
          profile: {
            id: 'demo-user-2',
            email: 'manager@example.com',
            first_name: 'Manager',
            last_name: 'User',
            role: 'manager',
            phone_number: null,
            preferred_language: 'en',
            profile_image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ];

      setUsers(mockUsers);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserManagement
      users={users}
      isLoading={isLoading}
      error={error}
      roles={roles}
      onRefresh={fetchUsers}
    />
  );
};

export default UserManagementContainer;
