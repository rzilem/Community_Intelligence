
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';

interface ProfileSyncAlertProps {
  syncInfo: string | null;
  syncResult: { success: boolean; created_count: number } | null;
  userCount: number;
  isLoading: boolean;
}

const ProfileSyncAlert: React.FC<ProfileSyncAlertProps> = ({ 
  syncInfo, 
  syncResult, 
  userCount,
  isLoading 
}) => {
  if (isLoading) return null;
  
  return (
    <>
      {syncInfo && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {syncInfo}
          </AlertDescription>
        </Alert>
      )}
      
      {syncResult && syncResult.created_count > 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully created {syncResult.created_count} new user profiles. 
            These users should now appear in the list below.
          </AlertDescription>
        </Alert>
      )}
      
      {userCount === 0 && !isLoading && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No user profiles found. Try clicking "Sync Missing Profiles" to create profiles 
            for all authenticated users.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ProfileSyncAlert;
