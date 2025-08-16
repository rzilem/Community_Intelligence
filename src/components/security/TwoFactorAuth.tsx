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
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

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
      const { data, error } = await supabase.rpc('check_totp_status', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      const enabled = data?.enabled || false;
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
      
      // Generate a random secret (32 characters, base32)
      const secretKey = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[b % 32])
        .join('');
      
      setSecret(secretKey);
      
      // Generate QR code URL for authenticator apps
      const issuer = 'Community Intelligence';
      const accountName = user.email || user.id;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secretKey}&issuer=${encodeURIComponent(issuer)}`;
      
      // Use QR code service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
      setQrCode(qrCodeUrl);
      
      // Store the secret (unverified)
      const { error } = await supabase.rpc('upsert_totp_secret', {
        p_user_id: user.id,
        p_totp_secret: secretKey,
        p_verified: false
      });

      if (error) throw error;
      
      setSetupStep('setup');
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      toast.error('Failed to generate 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!user || !verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify the TOTP code
      const { data, error } = await supabase.rpc('verify_totp', {
        p_user_id: user.id,
        p_token: verificationCode
      });

      if (error) throw error;
      
      if (data?.valid) {
        // Mark as verified and enabled
        await supabase.rpc('set_totp_verified', {
          p_user_id: user.id,
          p_verified: true
        });

        setIsEnabled(true);
        setSetupStep('check');
        onStatusChange?.(true);
        toast.success('Two-factor authentication enabled successfully!');
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify 2FA code');
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  const disable2FA = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase.rpc('delete_totp_secret', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      setIsEnabled(false);
      setSetupStep('check');
      setSecret('');
      setQrCode('');
      onStatusChange?.(false);
      toast.success('Two-factor authentication disabled');
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
                  {secret}
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
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={verifyAndEnable} 
              disabled={isLoading || verificationCode.length !== 6}
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