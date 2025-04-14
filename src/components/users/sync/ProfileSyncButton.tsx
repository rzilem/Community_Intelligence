
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProfileSyncButtonProps {
  syncInProgress: boolean;
  onSync: () => void;
}

const ProfileSyncButton: React.FC<ProfileSyncButtonProps> = ({ 
  syncInProgress, 
  onSync 
}) => {
  return (
    <Button 
      onClick={onSync} 
      variant="outline" 
      className="flex items-center gap-2"
      disabled={syncInProgress}
    >
      {syncInProgress ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Sync Missing Profiles
    </Button>
  );
};

export default ProfileSyncButton;
