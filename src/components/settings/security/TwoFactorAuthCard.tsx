
import React, { useState, useEffect } from 'react';
import { Key, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { twoFactorService } from '@/services/auth/two-factor-service';
import { TwoFactorSetup } from '@/components/auth/two-factor/TwoFactorSetup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TwoFactorAuthCardProps {
  twoFactorEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuthCard: React.FC<TwoFactorAuthCardProps> = ({ 
  twoFactorEnabled, 
  onToggle 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupData, setSetupData] = useState<{ secretKey: string, qrCodeUrl: string } | null>(null);

  // Check actual 2FA status from the server
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const enabled = await twoFactorService.isEnabled();
        if (enabled !== twoFactorEnabled) {
          onToggle(enabled);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };

    checkStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setIsLoading(true);
      try {
        const { secretKey, qrCodeUrl } = await twoFactorService.setup();
        setSetupData({ secretKey, qrCodeUrl });
        setIsSetupOpen(true);
      } catch (error) {
        toast.error('Failed to set up two-factor authentication');
        console.error('2FA setup error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const success = await twoFactorService.disable();
        if (success) {
          onToggle(false);
        }
      } catch (error) {
        toast.error('Failed to disable two-factor authentication');
        console.error('2FA disable error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async (token: string): Promise<boolean> => {
    try {
      const isValid = await twoFactorService.verifySetup(token);
      if (isValid) {
        onToggle(true);
        setIsSetupOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  const handleCancelSetup = () => {
    setIsSetupOpen(false);
    twoFactorService.disable().catch(console.error);
  };

  const handleRegenerateCode = async () => {
    setIsLoading(true);
    try {
      const { secretKey, qrCodeUrl } = await twoFactorService.setup();
      setSetupData({ secretKey, qrCodeUrl });
    } catch (error) {
      toast.error('Failed to regenerate two-factor authentication code');
      console.error('2FA regenerate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSetupOpen && setupData ? (
          <TwoFactorSetup
            secretKey={setupData.secretKey}
            qrCodeUrl={setupData.qrCodeUrl}
            onVerify={handleVerify}
            onCancel={handleCancelSetup}
            onRegenerateCode={handleRegenerateCode}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactor">Enable two-factor authentication</Label>
              <Switch 
                id="twoFactor" 
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle}
                disabled={isLoading} 
              />
            </div>
            
            {twoFactorEnabled && (
              <div className="pt-4 space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Two-factor authentication is enabled</AlertTitle>
                  <AlertDescription>
                    You will be asked for a verification code when logging in from an unrecognized device.
                  </AlertDescription>
                </Alert>
                
                <Button variant="outline" className="w-full" onClick={() => handleToggle(false)}>
                  Disable Two-Factor Authentication
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuthCard;
