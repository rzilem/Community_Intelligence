import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserCircle, Loader2, Settings, Lock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { toast } from 'sonner';
import UserProfileForm from '@/components/users/UserProfileForm';
import UserSecurityForm from '@/components/users/UserSecurityForm';
import UserPreferencesForm from '@/components/users/UserPreferencesForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [imageVersion, setImageVersion] = useState(Date.now());

  const handleProfileImageUpdated = async (newUrl: string) => {
    toast.success('Profile image updated successfully');
    await refreshProfile();
    setImageVersion(Date.now());
  };

  const handleProfileUpdated = async () => {
    await refreshProfile();
  };

  if (!user) {
    return (
      <AppLayout>
        <PageTemplate 
          title="User Profile" 
          icon={<UserCircle className="h-8 w-8" />}
          description="Manage your account settings and preferences"
        >
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Please login to view your profile</p>
            </CardContent>
          </Card>
        </PageTemplate>
      </AppLayout>
    );
  }

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
              <TabsTrigger value="info" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <ProfileImageUpload
                        userId={user.id}
                        imageUrl={`${profile?.profile_image_url}?v=${imageVersion}`} 
                        firstName={profile?.first_name || ''}
                        lastName={profile?.last_name || ''}
                        onImageUpdated={handleProfileImageUpdated}
                        size="lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click on the avatar to upload a new image
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        Recommended size: 400x400 pixels
                        <br />
                        Max file size: 5MB
                        <br />
                        Supported formats: JPG, PNG, WebP
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
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <UserSecurityForm userId={user.id} />
                    
                    <div className="pt-6 border-t">
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an additional layer of security to your account
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Two-factor authentication will be available in a future update.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience with Community Intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserPreferencesForm userId={user.id} />
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
