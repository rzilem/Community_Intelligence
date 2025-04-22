import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, FileText, Home, User, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHomeownerData } from '@/hooks/homeowners/useHomeownerData';
import { useResidentPortalSettings } from '@/hooks/homeowners/resident/useResidentPortalSettings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import CollaborationIndicator from '@/components/portal/CollaborationIndicator';
import { useResidentNotes } from '@/hooks/homeowners/resident/useResidentNotes';
import { UserWithProfile } from '@/types/user-types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const HomeownerPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const homeownerId = searchParams.get('id');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { homeowner, loading, error } = useHomeownerData(homeownerId || '');
  const [accessTime] = useState(new Date());
  const { addNote } = homeownerId ? useResidentNotes(homeownerId) : { addNote: null };
  const { 
    settings: portalSettings, 
    loading: settingsLoading, 
    updatePortalSettings 
  } = useResidentPortalSettings(homeownerId || '');

  useEffect(() => {
    const logAccess = async () => {
      if (homeownerId && user && addNote) {
        try {
          const currentUser = user as unknown as UserWithProfile;
          const userName = currentUser.profile?.first_name && currentUser.profile?.last_name 
            ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
            : currentUser.email || 'Customer Service';
          
          await addNote({
            type: 'system',
            content: `Portal viewed by customer service (${userName})`,
            author: 'System'
          });
          
          console.log('Customer service portal access logged:', {
            homeownerId,
            accessedBy: user.id,
            accessTime: accessTime.toISOString()
          });
        } catch (error) {
          console.error('Error logging portal access:', error);
        }
      }
    };
    
    logAccess();
  }, [homeownerId, user, accessTime, addNote]);

  const handleNotificationToggle = (notificationType: string) => {
    if (!portalSettings?.notification_preferences) return;

    const updatedPreferences = {
      ...portalSettings.notification_preferences,
      [notificationType]: !portalSettings.notification_preferences[notificationType]
    };

    updatePortalSettings({ 
      notification_preferences: updatedPreferences 
    });
  };

  if (!homeownerId) {
    return (
      <AppLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Portal</AlertTitle>
            <AlertDescription>
              No homeowner ID provided. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading homeowner portal...</div>
      </AppLayout>
    );
  }

  if (error || !homeowner) {
    return (
      <AppLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Portal</AlertTitle>
            <AlertDescription>
              {error || 'Homeowner not found. Please check the ID and try again.'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">
                Homeowner Portal: {homeowner.name}
              </h1>
              <Badge className="ml-2" variant="outline">Customer Service View</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Viewing portal as it appears to the homeowner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CollaborationIndicator widgetId={`homeowner-portal-${homeownerId}`} />
            
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Portal
            </Button>
            
            <Button variant="default" asChild>
              <a href={`/homeowners/${homeownerId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Homeowner Profile
              </a>
            </Button>
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800 flex items-center gap-2">
            Customer Service Portal Access
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            You are viewing this homeowner's portal in read-only mode. Any actions taken here will be logged.
            <br />
            <span className="font-medium">Access time: {accessTime.toLocaleString()}</span>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Financial overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-medium">
                        ${homeowner.balance ? parseFloat(homeowner.balance).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Payment:</span>
                      <span className="font-medium">$145.00 on 10/15/2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Due:</span>
                      <span className="font-medium">$150.00 on 11/01/2023</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" disabled>
                    Make Payment
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>Address and details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium">
                        {homeowner.property} {homeowner.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Move-in Date:</span>
                      <span className="font-medium">
                        {homeowner.moveInDate ? new Date(homeowner.moveInDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={homeowner.status === 'Active' ? 'default' : 'outline'}>
                        {homeowner.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium">Monthly assessment posted</p>
                      <p className="text-xs text-muted-foreground">Oct 25, 2023</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-muted-foreground">Oct 15, 2023</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Community newsletter sent</p>
                      <p className="text-xs text-muted-foreground">Oct 1, 2023</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Important Documents</CardTitle>
                <CardDescription>
                  Community documents available to the homeowner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Community Rules & Regulations</p>
                      <p className="text-sm text-muted-foreground">Last updated: Sep 15, 2023</p>
                    </div>
                    <Button variant="outline" disabled>View</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">HOA Bylaws</p>
                      <p className="text-sm text-muted-foreground">Last updated: Jan 10, 2023</p>
                    </div>
                    <Button variant="outline" disabled>View</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Monthly Newsletter - October 2023</p>
                      <p className="text-sm text-muted-foreground">Last updated: Oct 1, 2023</p>
                    </div>
                    <Button variant="outline" disabled>View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Portal Settings</CardTitle>
                <CardDescription>Customize your portal experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="email-notifications"
                          checked={portalSettings?.notification_preferences?.email ?? false}
                          onCheckedChange={() => handleNotificationToggle('email')}
                        />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sms-notifications"
                          checked={portalSettings?.notification_preferences?.sms ?? false}
                          onCheckedChange={() => handleNotificationToggle('sms')}
                        />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Theme</h3>
                    <div className="space-y-2">
                      {['light', 'dark', 'system'].map(theme => (
                        <div key={theme} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`theme-${theme}`}
                            name="theme"
                            value={theme}
                            checked={portalSettings?.theme_preference === theme}
                            onChange={() => updatePortalSettings({ theme_preference: theme as any })}
                          />
                          <Label htmlFor={`theme-${theme}`}>{theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default HomeownerPortalPage;
