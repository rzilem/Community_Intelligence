
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserRoleBadgeProps {
  role: string;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const getBadgeVariant = () => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'unassigned':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant()}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

export default UserRoleBadge;
