
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UserProfile = () => {
  const { user, profile } = useAuth();

  const handleProfileImageUpdated = (newUrl: string) => {
    toast.success('Profile image updated successfully');
  };

  return (
    <AppLayout>
      <PageTemplate 
        title="User Profile" 
        icon={<UserCircle className="h-8 w-8" />}
        description="Manage your account settings and preferences"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <ProfileImageUpload
                    userId={user?.id || ''}
                    imageUrl={profile?.profile_image_url || ''}
                    firstName={profile?.first_name || ''}
                    lastName={profile?.last_name || ''}
                    onImageUpdated={handleProfileImageUpdated}
                    size="lg"
                  />
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                    <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                    <p className="font-medium">{user?.email || profile?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                    <p className="font-medium">{profile?.role || 'User'}</p>
                  </div>
                  
                  {profile?.phone_number && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                      <p className="font-medium">{profile.phone_number}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default UserProfile;
