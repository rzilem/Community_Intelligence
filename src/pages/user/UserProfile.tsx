
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UserProfileForm from '@/components/users/UserProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [imageVersion, setImageVersion] = useState(Date.now()); // Add a version to force re-render

  const handleProfileImageUpdated = async (newUrl: string) => {
    toast.success('Profile image updated successfully');
    await refreshProfile();
    setImageVersion(Date.now()); // Update the version to force a re-render
  };

  const handleProfileUpdated = async () => {
    await refreshProfile();
  };

  return (
    <AppLayout>
      <PageTemplate 
        title="User Profile" 
        icon={<UserCircle className="h-8 w-8" />}
        description="Manage your account settings and preferences"
      >
        <div className="space-y-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Personal Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <ProfileImageUpload
                        userId={user?.id || ''}
                        imageUrl={`${profile?.profile_image_url}?v=${imageVersion}`} 
                        firstName={profile?.first_name || ''}
                        lastName={profile?.last_name || ''}
                        onImageUpdated={handleProfileImageUpdated}
                        size="lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click on the avatar to upload a new image
                      </p>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <UserProfileForm 
                          profile={profile} 
                          onProfileUpdated={handleProfileUpdated} 
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an additional layer of security to your account
                      </p>
                      <Button variant="outline">Set Up 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Notification and display preferences will be added here in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default UserProfile;
