
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { UserWithProfile } from '@/types/user-types';
import UserRoleSelector from './UserRoleSelector';
import UserRoleBadge from './UserRoleBadge';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { UserRole } from '@/types/profile-types';

interface UserTableRowProps {
  user: UserWithProfile;
  roles: { id: UserRole; name: string }[];
  userRoles: Record<string, UserRole>;
  loading: Record<string, boolean>;
  refreshingProfile: Record<string, boolean>;
  onRoleUpdate: (userId: string, role: UserRole) => void;
  onProfileImageUpdate: (url: string) => Promise<void>;
  onRefreshProfile: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  roles,
  userRoles,
  loading,
  refreshingProfile,
  onRoleUpdate,
  onProfileImageUpdate,
  onRefreshProfile
}) => {
  const userRole = userRoles[user.id] || (user.profile?.role as UserRole) || 'user';
  const isLoading = loading[user.id] || false;
  const isRefreshing = refreshingProfile[user.id] || false;
  
  return (
    <TableRow key={user.id}>
      <TableCell className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <ProfileImageUpload
            userId={user.id}
            currentImageUrl={user.profile?.profile_image_url}
            onImageUpdate={onProfileImageUpdate}
          />
        </div>
        <div>
          <div className="font-medium">
            {user.profile?.first_name ? 
              `${user.profile.first_name} ${user.profile.last_name || ''}` : 
              'Unnamed User'
            }
          </div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </TableCell>
      <TableCell>
        {!user.profile ? (
          <div className="flex gap-2 items-center">
            <UserRoleBadge role="unassigned" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRefreshProfile(user.id)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2">{isRefreshing ? 'Creating profile...' : 'Create profile'}</span>
            </Button>
          </div>
        ) : (
          <div className="max-w-xs">
            <UserRoleSelector
              userId={user.id}
              currentRole={userRole}
              roles={roles}
              onRoleChange={onRoleUpdate}
              isDisabled={isLoading}
            />
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isLoading && <span className="text-sm text-muted-foreground">Updating...</span>}
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
