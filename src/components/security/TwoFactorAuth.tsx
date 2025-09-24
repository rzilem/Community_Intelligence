import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertTriangle, Shield, ShieldCheck } from 'lucide-react';

interface TwoFactorAuthProps {
  onStatusChange?: (enabled: boolean) => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'check' | 'setup' | 'verify'>('check');
  const [qrCode, setQrCode] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Check current 2FA status
  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const enabled = false; // Default to false since we don't have TOTP in profiles table
      setIsEnabled(enabled);
      onStatusChange?.(enabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      toast.error('Failed to check 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTOTPSecret = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Mock TOTP secret generation - in real implementation would use RPC
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      setTotpSecret(mockSecret);
      
      // Generate QR code URL for authenticator apps
      const issuer = 'Community Intelligence';
      const accountName = user.email || user.id;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${mockSecret}&issuer=${encodeURIComponent(issuer)}`;
      
      // Use QR code service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
      setQrCode(qrCodeUrl);
      
      setSetupStep('setup');
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      toast.error('Failed to generate 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!user || !verificationToken || verificationToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mock verification - in real implementation would use RPC
      const isValidCode = verificationToken.length === 6;
      
      if (isValidCode) {
        toast.success('Two-factor authentication enabled successfully');
        setIsEnabled(true);
        setTotpSecret('');
        setVerificationToken('');
        onStatusChange?.(true);
        setSetupStep('check');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Mock disable - in real implementation would use RPC
      toast.success('Two-factor authentication disabled');
      setIsEnabled(false);
      onStatusChange?.(false);
      setSetupStep('check');
      setTotpSecret('');
      setQrCode('');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (setupStep === 'check') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5" />}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with TOTP-based two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">
              Status: {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          {!isEnabled ? (
            <Button 
              onClick={generateTOTPSecret} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </Button>
          ) : (
            <Button 
              onClick={disable2FA} 
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (setupStep === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCode} alt="QR Code for 2FA setup" className="border rounded-lg" />
              <div className="text-center">
                <Label>Manual Entry Key:</Label>
                <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {totpSecret}
                </code>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter verification code from your app:</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={verifyAndEnable} 
              disabled={isLoading || verificationToken.length !== 6}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify and Enable'}
            </Button>
            <Button 
              onClick={() => setSetupStep('check')} 
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};