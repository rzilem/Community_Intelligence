
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ConfirmAuth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to') || '/dashboard';
        
        if (!tokenHash || !type) {
          throw new Error('Invalid confirmation link. Missing required parameters.');
        }
        
        let result;
        
        switch(type) {
          case 'signup':
          case 'invite':
            // Verify the email confirmation
            result = await supabase.auth.verifyOtp({
              type: 'signup',
              token_hash: tokenHash
            });
            break;
            
          case 'magiclink':
            // Verify magic link
            result = await supabase.auth.verifyOtp({
              type: 'magiclink',
              token_hash: tokenHash
            });
            break;
            
          case 'recovery':
            // Verify password recovery
            result = await supabase.auth.verifyOtp({
              type: 'recovery',
              token_hash: tokenHash
            });
            // For recovery, redirect to reset password page
            navigate('/reset-password', { replace: true });
            return;
            
          case 'email_change':
            // Verify email change
            result = await supabase.auth.verifyOtp({
              type: 'email_change',
              token_hash: tokenHash
            });
            break;
            
          default:
            throw new Error(`Unsupported confirmation type: ${type}`);
        }
        
        if (result.error) {
          throw result.error;
        }
        
        setSuccess(true);
        toast.success('Authentication successful');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 2000);
        
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'An error occurred during authentication');
        toast.error('Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    
    handleConfirmation();
  }, [location, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Confirming your authentication request</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">Verifying your authentication...</p>
            </div>
          )}
          
          {!loading && success && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center">Authentication successful! Redirecting you...</p>
            </div>
          )}
          
          {!loading && error && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive">{error}</p>
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmAuth;
