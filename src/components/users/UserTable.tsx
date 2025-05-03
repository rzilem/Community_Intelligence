
import React from 'react';
import { UserWithProfile } from '@/types/user-types';
import { Table, TableBody } from '@/components/ui/table';
import { useUserRoles } from './hooks/useUserRoles';
import UserTableHeader from './table/UserTableHeader';
import UserTableRow from './table/UserTableRow';
import EmptyUserTable from './table/EmptyUserTable';
import { UserRole } from '@/types/profile-types';

interface UserTableProps {
  users: UserWithProfile[];
  roles: { id: UserRole; name: string }[];
  onRoleUpdate: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  roles, 
  onRoleUpdate 
}) => {
  const { 
    userRoles, 
    loading, 
    refreshingProfile, 
    updateUserRole, 
    refreshUserProfile 
  } = useUserRoles(users, onRoleUpdate);
  
  return (
    <Table>
      <UserTableHeader />
      <TableBody>
        {users.length === 0 ? (
          <EmptyUserTable />
        ) : (
          users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              roles={roles}
              userRoles={userRoles}
              loading={loading}
              refreshingProfile={refreshingProfile}
              onRoleUpdate={updateUserRole}
              onProfileImageUpdated={() => onRoleUpdate()}
              onRefreshProfile={refreshUserProfile}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
