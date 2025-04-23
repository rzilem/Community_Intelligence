
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { UserCircle, Settings, Lock, Bell, Truck, FileText, Award } from 'lucide-react';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import UserProfileForm from '@/components/users/UserProfileForm';
import UserSecurityForm from '@/components/users/UserSecurityForm';
import UserPreferencesForm from '@/components/users/UserPreferencesForm';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const VendorProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [imageVersion, setImageVersion] = useState(Date.now());

  if (!user) {
    return (
      <AppLayout>
        <div className="container p-6">
          <h1 className="text-2xl font-bold mb-4">Vendor Profile</h1>
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
        <h1 className="text-2xl font-bold">Vendor Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="vendor" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Company Information
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="vendor-details" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Vendor Details
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Update your company details and logo
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
                          Click on the avatar to upload your company logo
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
              
              <TabsContent value="vendor-details">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Information</CardTitle>
                    <CardDescription>
                      Your services and certifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Services Provided</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Landscaping</Badge>
                          <Badge variant="outline">Lawn Maintenance</Badge>
                          <Badge variant="outline">Irrigation</Badge>
                          <Badge variant="outline">Tree Trimming</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Active Contracts</h3>
                        <div className="space-y-2">
                          <div className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <span className="font-medium">Oakwood Heights HOA</span>
                              <span className="text-sm text-muted-foreground">Expires: Dec 31, 2023</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Monthly maintenance and landscaping</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <div className="flex justify-between">
                              <span className="font-medium">Lakeside Community</span>
                              <span className="text-sm text-muted-foreground">Expires: March 15, 2024</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Quarterly services and annual plantings</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Certifications & Insurance</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-500" />
                            <span>Business License: #B12345678</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-500" />
                            <span>Professional Landscaper Certification</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-500" />
                            <span>Commercial Liability Insurance: $2M</span>
                          </div>
                        </div>
                      </div>
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

export default VendorProfilePage;
