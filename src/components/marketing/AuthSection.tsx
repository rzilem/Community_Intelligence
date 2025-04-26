
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const AuthSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  
  const { signIn, signUp, signInWithMagicLink, isLoading } = useAuth();
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the signIn function
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    try {
      await signUp(
        signupData.email, 
        signupData.password, 
        { 
          first_name: signupData.firstName, 
          last_name: signupData.lastName 
        }
      );
    } catch (error) {
      // Error is handled in the signUp function
      console.error('Signup error:', error);
    }
  };

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!magicLinkEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      const success = await signInWithMagicLink(magicLinkEmail);
      if (success) {
        setMagicLinkSent(true);
      }
    } catch (error) {
      // Error is handled in the signInWithMagicLink function
      console.error('Magic link error:', error);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Access your HOA management dashboard
                  </CardDescription>
                </CardHeader>
                {!showMagicLinkForm ? (
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          placeholder="john@example.com" 
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <Button variant="link" className="h-auto p-0" size="sm" type="button">
                            Forgot Password?
                          </Button>
                        </div>
                        <Input 
                          id="login-password" 
                          type="password" 
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Log In'
                        )}
                      </Button>
                      <div className="w-full flex flex-col items-center gap-2">
                        <Separator />
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          type="button" 
                          onClick={() => setShowMagicLinkForm(true)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Sign in with Magic Link
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                ) : magicLinkSent ? (
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md text-center">
                      <p className="text-green-600 font-medium">Magic link sent!</p>
                      <p className="text-green-600 text-sm mt-2">
                        Check your email and click the link to log in.
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setShowMagicLinkForm(false);
                        setMagicLinkSent(false);
                        setMagicLinkEmail('');
                      }}
                    >
                      Back to login
                    </Button>
                  </CardContent>
                ) : (
                  <form onSubmit={handleMagicLinkRequest}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="magic-link-email">Email</Label>
                        <Input 
                          id="magic-link-email" 
                          type="email" 
                          placeholder="john@example.com" 
                          value={magicLinkEmail}
                          onChange={(e) => setMagicLinkEmail(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending magic link...
                          </>
                        ) : (
                          'Send Magic Link'
                        )}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        type="button"
                        onClick={() => setShowMagicLinkForm(false)}
                      >
                        Back to login
                      </Button>
                    </CardFooter>
                  </form>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join Community Intelligence today
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          type="text" 
                          placeholder="John"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          type="text" 
                          placeholder="Doe"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="john@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
