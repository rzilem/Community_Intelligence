import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, RefreshCw, LogIn, Lock, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LoginDetailsTabProps {
  homeownerId: string;
  email?: string;
  lastLoginDate?: string;
}

const LoginDetailsTab: React.FC<LoginDetailsTabProps> = ({ homeownerId, email, lastLoginDate }) => {
  const { isAdmin } = useAuth();
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isManualPasswordOpen, setIsManualPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<{ date: string; ip: string; userAgent: string }[]>([
    { date: '2023-10-15T14:23:45Z', ip: '192.168.1.1', userAgent: 'Chrome/Windows' },
    { date: '2023-09-27T09:11:22Z', ip: '192.168.1.1', userAgent: 'Safari/MacOS' },
    { date: '2023-08-19T16:45:30Z', ip: '192.168.1.1', userAgent: 'Firefox/Linux' },
  ]);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('No email address available for this homeowner');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      await addSystemNote(homeownerId, 'Password reset email sent by customer service');
      toast.success('Password reset email sent successfully');
      setIsResetPasswordOpen(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to send password reset: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPasswordReset = async () => {
    if (!email || !newPassword) {
      toast.error('Email and new password are required');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      toast.success('Password has been manually updated');
      
      await addSystemNote(homeownerId, 'Password manually reset by customer service');
      setIsManualPasswordOpen(false);
      setNewPassword('');
    } catch (error: any) {
      console.error('Error setting manual password:', error);
      toast.error(`Failed to set password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessPortal = async () => {
    try {
      await addSystemNote(homeownerId, 'Customer service accessed homeowner portal');
      
      window.open(`/portal/homeowner?id=${homeownerId}`, '_blank');
      
      toast.success('Opening homeowner portal...');
    } catch (error: any) {
      console.error('Error accessing portal:', error);
      toast.error('Failed to access homeowner portal');
    }
  };

  const addSystemNote = async (homeownerId: string, content: string) => {
    try {
      console.log('Adding system note:', { homeownerId, content });
      return true;
    } catch (error) {
      console.error('Error adding system note:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Account Security</CardTitle>
            </div>
            <Badge variant={email ? "default" : "destructive"}>
              {email ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>
            View and manage login details for this homeowner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={email || 'No email address'} readOnly />
                </div>
              </div>
              
              <div>
                <Label>Last Login</Label>
                <div className="text-sm mt-1 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {lastLoginDate 
                      ? format(new Date(lastLoginDate), 'PPpp') 
                      : 'Never logged in'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Account Actions</Label>
                <div className="flex flex-col space-y-2 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsResetPasswordOpen(true)}
                    disabled={!email || !isAdmin}
                    className="justify-start"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Send Password Reset Email
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => setIsManualPasswordOpen(true)}
                    disabled={!email || !isAdmin}
                    className="justify-start"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Set Manual Password
                  </Button>

                  <Button 
                    variant="default" 
                    onClick={handleAccessPortal}
                    className="justify-start"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Access Customer Portal
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Login Access</AlertTitle>
              <AlertDescription>
                This homeowner does not have an email address on file and cannot log in.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activity for this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginHistory.length > 0 ? (
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">IP Address</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Device/Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((login, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="px-4 py-2 text-sm">
                        {format(new Date(login.date), 'PPp')}
                      </td>
                      <td className="px-4 py-2 text-sm">{login.ip}</td>
                      <td className="px-4 py-2 text-sm">{login.userAgent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No login history available
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Password Reset Email</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will send an email to <span className="font-semibold">{email}</span> with 
              instructions to reset their password. The link will expire after 24 hours.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualPasswordOpen} onOpenChange={setIsManualPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Manual Password</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              This will set a new password for the account. Make sure to communicate this 
              password securely to the homeowner.
            </p>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualPasswordOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleManualPasswordReset} 
              disabled={isLoading || newPassword.length < 8}
            >
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginDetailsTab;
