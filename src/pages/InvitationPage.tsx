
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const InvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('resident_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        toast.error('Invalid or expired invitation');
        navigate('/');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error('This invitation has expired');
        navigate('/');
        return;
      }

      setInvitation(data);
      // Extract names from metadata if available
      const metadata = data.metadata as any;
      setFormData(prev => ({
        ...prev,
        firstName: metadata?.first_name || '',
        lastName: metadata?.last_name || ''
      }));
    } catch (error) {
      console.error('Error validating invitation:', error);
      toast.error('Error validating invitation');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setProcessing(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update invitation status
        await supabase
          .from('resident_invitations')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by: authData.user.id
          })
          .eq('id', invitation.id);

        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This invitation is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Registration
          </CardTitle>
          <p className="text-center text-gray-600">
            You've been invited to join the community
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitation.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationPage;
