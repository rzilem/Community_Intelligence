
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, ShieldAlert } from 'lucide-react';

interface TwoFactorVerificationProps {
  email: string;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
  onRecoveryOption: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerify,
  onCancel,
  onRecoveryOption,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;

    setIsVerifying(true);
    try {
      const isValid = await onVerify(verificationCode);
      if (!isValid) {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Two-Factor Verification</CardTitle>
        </div>
        <CardDescription>
          Enter the verification code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              A verification code has been sent to your authenticator app linked with {email}.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTP
                value={verificationCode}
                onChange={setVerificationCode}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2 justify-center">
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                onClick={onCancel}
              >
                Back to Login
              </Button>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                onClick={onRecoveryOption}
              >
                Can't access authenticator?
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
