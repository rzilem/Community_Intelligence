
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { UserCircle, Settings, Lock, Bell } from 'lucide-react';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import UserProfileForm from '@/components/users/UserProfileForm';
import UserSecurityForm from '@/components/users/UserSecurityForm';
import UserPreferencesForm from '@/components/users/UserPreferencesForm';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { toast } from 'sonner';

const HomeownerProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [imageVersion, setImageVersion] = useState(Date.now());

  if (!user) {
    return (
      <AppLayout>
        <div className="container p-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Please login to view your profile</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  const handleProfileImageUpdated = async (newUrl: string) => {
    toast.success('Profile image updated successfully');
    await refreshProfile();
    setImageVersion(Date.now());
  };

  const handleProfileUpdated = async () => {
    await refreshProfile();
  };

  return (
    <AppLayout>
      <div className="container p-6 space-y-6">
        <h1 className="text-2xl font-bold">Homeowner Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="homeowner" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
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
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <UserProfileForm 
                          profile={profile} 
                          onProfileUpdated={handleProfileUpdated} 
                        />
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
                    <UserSecurityForm userId={user.id} />
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
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeownerProfilePage;
