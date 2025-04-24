
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  KeyRound, 
  Bell, 
  CreditCard, 
  Building, 
  Settings, 
  ArrowLeft, 
  Check, 
  Loader2,
  Save
} from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth';

const ResaleAccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'Jane',
    lastName: 'Smith',
    email: user?.email || 'jane.smith@example.com',
    phone: '(555) 123-4567',
    company: 'ABC Title Company',
    role: 'title-company'
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    orderCompleted: true,
    marketing: false,
    emailNotifications: true,
    smsNotifications: false
  });
  
  // Payment methods (mock data)
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2026,
      isDefault: true
    }
  ]);
  
  // Company preferences
  const [companyPreferences, setCompanyPreferences] = useState({
    defaultCompany: 'ABC Title Company',
    defaultRole: 'title-company',
    saveAddressHistory: true,
    autofillLastUsed: true
  });
  
  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCompanyPreferenceChange = (field: string, value: any) => {
    setCompanyPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveSettings = (section: string) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: `Your ${section} settings have been updated.`,
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast({
      title: "Payment Method Removed",
      description: "Your payment method has been removed successfully.",
    });
  };
  
  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast({
      title: "Default Payment Method Updated",
      description: "Your default payment method has been updated.",
    });
  };
  
  return (
    <PageTemplate 
      title="Account Settings"
      icon={<Settings className="h-8 w-8" />}
      description="Manage your profile, notifications, and payment methods"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/resale-portal')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Payment Methods</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how it appears on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company"
                  value={profile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={profile.role}
                  onValueChange={(value) => handleProfileChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title-company">Title Company</SelectItem>
                    <SelectItem value="real-estate-agent">Real Estate Agent</SelectItem>
                    <SelectItem value="law-office">Law Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('profile')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="twoFactorAuth" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Session Management</h3>
                    <p className="text-sm text-muted-foreground">Manage your active sessions and devices</p>
                  </div>
                  <Button variant="outline" size="sm">Manage Sessions</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('security')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-medium">Order Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates" className="font-normal">Order Status Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when your order status changes</p>
                    </div>
                    <Switch 
                      id="orderUpdates" 
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderCompleted" className="font-normal">Order Completion</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when your documents are ready</p>
                    </div>
                    <Switch 
                      id="orderCompleted"
                      checked={notifications.orderCompleted}
                      onCheckedChange={(checked) => handleNotificationChange('orderCompleted', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="font-normal">Marketing & Promotions</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about new features and special offers</p>
                    </div>
                    <Switch 
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Notification Delivery</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="font-normal">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="font-normal">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                    </div>
                    <Switch 
                      id="smsNotifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('notifications')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for ordering documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Saved Payment Methods</h3>
                
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{method.brand} •••• {method.last4}</p>
                            <p className="text-sm text-muted-foreground">Expires {method.expMonth}/{method.expYear}</p>
                          </div>
                          {method.isDefault && (
                            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No Payment Methods</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any saved payment methods yet.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-4">Billing Address</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingName">Name on Card</Label>
                      <Input id="billingName" defaultValue="Jane Smith" />
                    </div>
                    <div>
                      <Label htmlFor="billingCompany">Company (Optional)</Label>
                      <Input id="billingCompany" defaultValue="ABC Title Company" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billingAddress">Address</Label>
                    <Input id="billingAddress" defaultValue="123 Business Ave" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="billingCity">City</Label>
                      <Input id="billingCity" defaultValue="Anytown" />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State</Label>
                      <Input id="billingState" defaultValue="TX" />
                    </div>
                    <div>
                      <Label htmlFor="billingZip">ZIP Code</Label>
                      <Input id="billingZip" defaultValue="75001" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('payment')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Billing Information
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Preferences</CardTitle>
              <CardDescription>
                Manage your company information and ordering preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCompany">Default Company</Label>
                  <Input 
                    id="defaultCompany"
                    value={companyPreferences.defaultCompany}
                    onChange={(e) => handleCompanyPreferenceChange('defaultCompany', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultRole">Default Role</Label>
                  <Select 
                    value={companyPreferences.defaultRole}
                    onValueChange={(value) => handleCompanyPreferenceChange('defaultRole', value)}
                  >
                    <SelectTrigger id="defaultRole">
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title-company">Title Company</SelectItem>
                      <SelectItem value="real-estate-agent">Real Estate Agent</SelectItem>
                      <SelectItem value="law-office">Law Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Ordering Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="saveAddressHistory" className="font-normal">Save Address History</Label>
                      <p className="text-sm text-muted-foreground">Save previously used property addresses for quick selection</p>
                    </div>
                    <Switch 
                      id="saveAddressHistory"
                      checked={companyPreferences.saveAddressHistory}
                      onCheckedChange={(checked) => handleCompanyPreferenceChange('saveAddressHistory', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autofillLastUsed" className="font-normal">Autofill Last Used</Label>
                      <p className="text-sm text-muted-foreground">Automatically fill forms with last used information</p>
                    </div>
                    <Switch 
                      id="autofillLastUsed"
                      checked={companyPreferences.autofillLastUsed}
                      onCheckedChange={(checked) => handleCompanyPreferenceChange('autofillLastUsed', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Team Access</h3>
                <p className="text-sm text-muted-foreground">Invite team members to access the portal under your company account</p>
                
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Manage Team Members
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('company')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ResaleAccountSettings;
