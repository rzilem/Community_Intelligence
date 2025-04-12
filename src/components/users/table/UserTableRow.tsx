
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserWithProfile } from '@/types/user-types';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import UserRoleBadge from './UserRoleBadge';
import UserRoleSelector from './UserRoleSelector';
import UserActions from './UserActions';

interface UserTableRowProps {
  user: UserWithProfile;
  roles: { id: string; name: string }[];
  userRoles: Record<string, string>;
  loading: Record<string, boolean>;
  refreshingProfile: Record<string, boolean>;
  onRoleUpdate: (userId: string, role: string) => void;
  onProfileImageUpdated: (userId: string, newUrl: string) => void;
  onRefreshProfile: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  roles,
  userRoles,
  loading,
  refreshingProfile,
  onRoleUpdate,
  onProfileImageUpdated,
  onRefreshProfile
}) => {
  const userRole = userRoles[user.id] || user.profile?.role || 'user';
  
  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <ProfileImageUpload
            userId={user.id}
            imageUrl={user.profile?.profile_image_url}
            firstName={user.profile?.first_name}
            lastName={user.profile?.last_name}
            onImageUpdated={(newUrl) => onProfileImageUpdated(user.id, newUrl)}
            size="sm"
          />
          <div>
            <p className="font-medium">
              {user.profile?.first_name || 'Unknown'} {user.profile?.last_name || 'User'}
              {(!user.profile?.first_name && !user.profile?.last_name) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 px-2 text-xs"
                  onClick={() => onRefreshProfile(user.id)}
                  disabled={refreshingProfile[user.id]}
                >
                  {refreshingProfile[user.id] ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  <span className="ml-1">Refresh</span>
                </Button>
              )}
            </p>
            <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email || 'No email'}</TableCell>
      <TableCell>
        <UserRoleBadge role={user.profile?.role} />
      </TableCell>
      <TableCell>
        <UserRoleSelector
          userId={user.id}
          currentRole={userRole}
          roles={roles}
          onRoleChange={onRoleUpdate}
          isDisabled={loading[user.id]}
        />
      </TableCell>
      <TableCell className="text-right">
        <UserActions
          userId={user.id}
          isLoading={loading[user.id]}
          currentRole={user.profile?.role}
          onPromoteAdmin={() => onRoleUpdate(user.id, 'admin')}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
