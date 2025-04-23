
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { UserCircle, Settings, Lock, Bell, Shield, Calendar } from 'lucide-react';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import UserProfileForm from '@/components/users/UserProfileForm';
import UserSecurityForm from '@/components/users/UserSecurityForm';
import UserPreferencesForm from '@/components/users/UserPreferencesForm';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { toast } from 'sonner';

const BoardProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [imageVersion, setImageVersion] = useState(Date.now());

  if (!user) {
    return (
      <AppLayout>
        <div className="container p-6">
          <h1 className="text-2xl font-bold mb-4">Board Member Profile</h1>
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
        <h1 className="text-2xl font-bold">Board Member Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="board" />
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
                <TabsTrigger value="board-details" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Board Details
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
              
              <TabsContent value="board-details">
                <Card>
                  <CardHeader>
                    <CardTitle>Board Member Information</CardTitle>
                    <CardDescription>
                      Your board role and membership details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground">Board Position</p>
                          <p className="font-medium">Treasurer</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground">Term Ends</p>
                          <p className="font-medium">December 31, 2025</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground">Joined Board</p>
                          <p className="font-medium">January 15, 2022</p>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground">Committee Memberships</p>
                          <p className="font-medium">Finance, Architectural Review</p>
                        </div>
                      </div>
                      
                      <Card className="bg-muted/50 border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Upcoming Board Meetings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Budget Review Meeting</span>
                              </div>
                              <span className="text-sm text-muted-foreground">Oct 15, 2023</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Annual Board Election</span>
                              </div>
                              <span className="text-sm text-muted-foreground">Nov 30, 2023</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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

export default BoardProfilePage;
