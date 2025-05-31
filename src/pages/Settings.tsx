import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <PageTemplate
      title="Settings"
      icon={<SettingsIcon className="h-8 w-8" />}
      description="Manage your account settings and preferences"
    >
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark mode for a better viewing experience.</p>
            </div>
            <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} disabled />
          </div>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default Settings;
