
import React from 'react';
import { Shield, Key, Clock, Globe, ListFilter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SecuritySettings } from '@/types/settings-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SecurityTabProps {
  settings: SecuritySettings;
  onChange: (settings: Partial<SecuritySettings>) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ settings, onChange }) => {
  const handleSessionTimeoutChange = (value: string) => {
    onChange({ sessionTimeout: parseInt(value, 10) });
  };

  const handleRemoveWhitelistItem = (ip: string) => {
    const updatedWhitelist = settings.ipWhitelist.filter(item => item !== ip);
    onChange({ ipWhitelist: updatedWhitelist });
    toast.success(`Removed ${ip} from IP whitelist`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="twoFactor">Enable two-factor authentication</Label>
            <Switch 
              id="twoFactor" 
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => onChange({ twoFactorAuth: checked })} 
            />
          </div>
          
          {settings.twoFactorAuth && (
            <div className="pt-4 space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm">Two-factor authentication is currently <strong>enabled</strong>.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You will be asked for a verification code when logging in from an unrecognized device.
                </p>
              </div>
              
              <Button variant="outline" className="w-full">
                Reconfigure Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Session Settings</CardTitle>
          </div>
          <CardDescription>
            Control your session timeout and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sessionTimeout">Session timeout</Label>
            <Select 
              value={settings.sessionTimeout.toString()} 
              onValueChange={handleSessionTimeoutChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="passwordReset">Password reset interval</Label>
            <Select 
              value={settings.passwordResetInterval.toString()} 
              onValueChange={(value) => onChange({ passwordResetInterval: parseInt(value, 10) })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>IP Whitelist</CardTitle>
          </div>
          <CardDescription>
            Restrict access to trusted IP addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.ipWhitelist.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.ipWhitelist.map((ip) => (
                <Badge key={ip} variant="secondary" className="px-3 py-1">
                  {ip}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 ml-1 p-0" 
                    onClick={() => handleRemoveWhitelistItem(ip)}
                  >
                    ✕
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No IP addresses in the whitelist.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Add IP Address</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Log</CardTitle>
          </div>
          <CardDescription>
            View recent security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">View Security Log</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
