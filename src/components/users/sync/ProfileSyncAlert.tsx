
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface ProfileSyncAlertProps {
  syncInfo: {
    totalAuthUsers: number;
    missingProfiles: number;
  } | null;
  syncResult: {
    success: number;
    failed: number;
    needsSupabaseAdmin?: boolean;
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
    // Special case: Supabase admin privileges needed
    if (syncResult.needsSupabaseAdmin) {
      return (
        <Alert className="mb-6" variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Supabase Admin Privileges Required</AlertTitle>
          <AlertDescription>
            <p>
              The sync feature requires admin privileges in Supabase to access the auth.users table.
              You're logged in as an application admin, but you need Supabase project admin access too.
            </p>
            <p className="mt-2">
              To see all users, you'll need to either:
            </p>
            <ul className="list-disc pl-5 mt-1">
              <li>Login to Supabase with an account that has admin privileges</li>
              <li>Create new users directly in this application instead of Supabase Auth</li>
              <li>Create user profiles manually for existing auth users</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }
    
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
  
  if (userCount > 0) {
    return (
      <Alert className="mb-6" variant="default">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Users Available</AlertTitle>
        <AlertDescription>
          {userCount} user profile{userCount !== 1 ? 's' : ''} found in the system.
          <span className="block text-sm mt-1 text-muted-foreground">
            Note: To see all auth users, you need Supabase admin privileges. You can directly create users in this application instead.
          </span>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default ProfileSyncAlert;
