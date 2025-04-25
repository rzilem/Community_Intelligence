
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserRound } from 'lucide-react';
import { UserWithProfile } from '@/types/user-types';
import UserRoleSelector from './UserRoleSelector';
import UserRoleBadge from './UserRoleBadge';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { formatDate } from '@/lib/date-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserTableRowProps {
  user: UserWithProfile;
  roles: { id: string; name: string }[];
  userRoles: Record<string, string>;
  loading: Record<string, boolean>;
  refreshingProfile: Record<string, boolean>;
  onRoleUpdate: (userId: string, role: string) => void;
  onProfileImageUpdated: () => void;
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
  const isLoading = loading[user.id] || false;
  const isRefreshing = refreshingProfile[user.id] || false;
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
    } else if (user.profile?.first_name) {
      return user.profile.first_name[0].toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  
  // Get display name
  const getDisplayName = () => {
    if (user.profile?.first_name) {
      return `${user.profile.first_name} ${user.profile.last_name || ''}`.trim();
    }
    return 'Unnamed User';
  };
  
  return (
    <TableRow key={user.id}>
      <TableCell className="w-[250px]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.profile ? (
              <ProfileImageUpload
                userId={user.id}
                imageUrl={user.profile?.profile_image_url}
                firstName={user.profile?.first_name}
                lastName={user.profile?.last_name}
                onImageUpdated={onProfileImageUpdated}
                size="md"
              />
            ) : (
              <Avatar className="h-10 w-10 border border-gray-200">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserRound size={20} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div>
            <div className="font-medium">
              {getDisplayName()}
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.profile?.phone_number || '-'}</TableCell>
      <TableCell>{formatDate(user.created_at)}</TableCell>
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
