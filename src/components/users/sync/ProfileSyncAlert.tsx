
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ProfileSyncAlertProps {
  syncInfo: {
    totalAuthUsers: number;
    missingProfiles: number;
  } | null;
  syncResult: {
    success: number;
    failed: number;
  } | null;
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
  
  // Show sync results if available
  if (syncResult) {
    if (syncResult.success > 0 || syncResult.failed > 0) {
      return (
        <Alert className="mb-6" variant={syncResult.failed > 0 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sync Results</AlertTitle>
          <AlertDescription>
            {syncResult.success > 0 && (
              <div className="flex items-center text-green-600 mt-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Successfully synced {syncResult.success} user profile{syncResult.success !== 1 ? 's' : ''}
              </div>
            )}
            {syncResult.failed > 0 && (
              <div className="mt-2">
                Failed to sync {syncResult.failed} user profile{syncResult.failed !== 1 ? 's' : ''}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }
  
  // Show sync info if available
  if (syncInfo && syncInfo.missingProfiles > 0) {
    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Profile Sync Needed</AlertTitle>
        <AlertDescription>
          Found {syncInfo.totalAuthUsers} users in the authentication system, but {syncInfo.missingProfiles} are missing
          profiles. Click "Sync Missing Profiles" to create profiles for these users.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show status info when everything is synced
  if (syncInfo && syncInfo.missingProfiles === 0 && userCount > 0) {
    return (
      <Alert className="mb-6" variant="default">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>All Profiles Synced</AlertTitle>
        <AlertDescription>
          All {userCount} users have profiles in the system.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default ProfileSyncAlert;
