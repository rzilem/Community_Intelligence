
import React from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TwoFactorAuthCardProps {
  twoFactorEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuthCard: React.FC<TwoFactorAuthCardProps> = ({ 
  twoFactorEnabled, 
  onToggle 
}) => {
  return (
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
            checked={twoFactorEnabled}
            onCheckedChange={onToggle} 
          />
        </div>
        
        {twoFactorEnabled && (
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
  );
};

export default TwoFactorAuthCard;
