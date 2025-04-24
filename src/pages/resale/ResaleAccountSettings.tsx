
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import PageTemplate from '@/components/layout/PageTemplate';
import { Settings, Save } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const ResaleAccountSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    email: user?.email || '',
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    company: '',
    phone: '',
    notifyOnStatusChange: true,
    notifyOnNewDocs: true,
    receivePromotions: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd call an API to update the settings
    toast({
      title: "Settings updated",
      description: "Your account settings have been updated successfully.",
    });
  };

  return (
    <PageTemplate
      title="Account Settings"
      icon={<Settings className="h-8 w-8" />}
      description="Manage your account preferences and notification settings"
      backLink="/resale-portal/my-orders"
    >
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose when and how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyOnStatusChange" className="font-medium">Order status changes</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when your order status changes
                </p>
              </div>
              <Switch
                id="notifyOnStatusChange"
                name="notifyOnStatusChange"
                checked={formData.notifyOnStatusChange}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyOnStatusChange: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyOnNewDocs" className="font-medium">Document availability</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when new documents are available
                </p>
              </div>
              <Switch
                id="notifyOnNewDocs"
                name="notifyOnNewDocs"
                checked={formData.notifyOnNewDocs}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyOnNewDocs: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="receivePromotions" className="font-medium">Marketing communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new services and promotions
                </p>
              </div>
              <Switch
                id="receivePromotions"
                name="receivePromotions"
                checked={formData.receivePromotions}
                onCheckedChange={(checked) => setFormData({ ...formData, receivePromotions: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
};

export default ResaleAccountSettings;
