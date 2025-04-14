
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
      variant="outline" 
      size="sm" 
      onClick={onSync}
      disabled={syncInProgress}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
      {syncInProgress ? 'Syncing Profiles...' : 'Sync Missing Profiles'}
    </Button>
  );
};

export default ProfileSyncButton;
