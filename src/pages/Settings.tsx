
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Settings, User, Bell, Shield, Palette, Smartphone, Globe, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    jobTitle: profile?.job_title || '',
    phone: profile?.phone || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    systemNotifications: true,
    marketingEmails: false,
    smsAlerts: true
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the profile in the database
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would change the password
    toast.success('Password changed successfully');
  };

  const toggleNotification = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notificationSettings]
    }));
  };

  return (
    <PageTemplate 
      title="Settings" 
      icon={<Settings className="h-8 w-8" />}
      description="Configure your account settings and preferences."
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
                  <p className="text-muted-foreground">{profile?.role || 'User'}</p>
                </div>
                <Button className="ml-auto" variant="outline">Change Photo</Button>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">To change your email, please contact support</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={profileForm.jobTitle}
                      onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Update Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notification Preferences</h2>
                  <p className="text-muted-foreground">Control how you receive notifications</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Updates</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailUpdates} 
                    onCheckedChange={() => toggleNotification('emailUpdates')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">System Notifications</h3>
                    <p className="text-sm text-muted-foreground">In-app notifications for system events</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.systemNotifications} 
                    onCheckedChange={() => toggleNotification('systemNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing Emails</h3>
                    <p className="text-sm text-muted-foreground">Receive promotional and newsletter emails</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.marketingEmails} 
                    onCheckedChange={() => toggleNotification('marketingEmails')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via text message</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.smsAlerts} 
                    onCheckedChange={() => toggleNotification('smsAlerts')}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Security Settings</h2>
                  <p className="text-muted-foreground">Manage your account security</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters with a mix of letters, numbers, and symbols
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  
                  <div>
                    <Button type="submit">Change Password</Button>
                  </div>
                </form>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Session Management</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Chrome on Windows • IP: 192.168.1.1 • Active now</p>
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Mobile Session</p>
                        <p className="text-xs text-muted-foreground">Safari on iPhone • IP: 192.168.1.2 • Last active: 2 hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Revoke</Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="mt-4">Revoke All Other Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Appearance Settings</h2>
                  <p className="text-muted-foreground">Customize your view</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border p-4 rounded-md flex flex-col items-center cursor-pointer bg-white">
                      <div className="bg-white border h-20 w-20 mb-2 rounded overflow-hidden">
                        <div className="bg-blue-500 h-4 w-full"></div>
                        <div className="p-2 text-center text-xs">Light</div>
                      </div>
                      <p className="text-sm font-medium">Light Mode</p>
                    </div>
                    
                    <div className="border p-4 rounded-md flex flex-col items-center cursor-pointer">
                      <div className="bg-gray-900 h-20 w-20 mb-2 rounded overflow-hidden">
                        <div className="bg-blue-600 h-4 w-full"></div>
                        <div className="p-2 text-center text-xs text-white">Dark</div>
                      </div>
                      <p className="text-sm font-medium">Dark Mode</p>
                    </div>
                    
                    <div className="border p-4 rounded-md flex flex-col items-center cursor-pointer">
                      <div className="bg-white dark:bg-gray-900 h-20 w-20 mb-2 rounded overflow-hidden">
                        <div className="bg-blue-500 dark:bg-blue-600 h-4 w-full"></div>
                        <div className="p-2 text-center text-xs">System</div>
                      </div>
                      <p className="text-sm font-medium">System Default</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Density</h3>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="compact" name="density" className="form-radio" />
                      <Label htmlFor="compact">Compact</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="default" name="density" className="form-radio" defaultChecked />
                      <Label htmlFor="default">Default</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="comfortable" name="density" className="form-radio" />
                      <Label htmlFor="comfortable">Comfortable</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default SettingsPage;
