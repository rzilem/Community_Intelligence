
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface TwoFactorSetupProps {
  secretKey: string;
  qrCodeUrl: string;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
  onRegenerateCode: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  secretKey,
  qrCodeUrl,
  onVerify,
  onCancel,
  onRegenerateCode,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    toast.success('Secret key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const isValid = await onVerify(verificationCode);
      if (isValid) {
        toast.success('Two-factor authentication enabled successfully');
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify code. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          <div className="flex justify-center p-4 bg-white">
            <img src={qrCodeUrl} alt="QR Code for 2FA" className="w-48 h-48" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="secret-key">Or enter this secret key manually:</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="secret-key" 
              value={secretKey} 
              readOnly 
              className="font-mono"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopySecretKey}
              title="Copy secret key"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter verification code from your app:</Label>
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
          
          <div className="flex justify-between items-center pt-2">
            <Button type="button" variant="ghost" onClick={onRegenerateCode}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Code
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={verificationCode.length !== 6 || isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
