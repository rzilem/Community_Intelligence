
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';

interface UserActionsProps {
  userId: string;
  isLoading: boolean;
  currentRole?: string;
  onPromoteAdmin: (userId: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({ 
  userId,
  isLoading,
  currentRole,
  onPromoteAdmin
}) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0"
      onClick={() => onPromoteAdmin(userId)}
      title="Grant admin privileges"
      disabled={isLoading || currentRole === 'admin'}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      ) : (
        <UserCheck className="h-4 w-4" />
      )}
    </Button>
  );
};

export default UserActions;
