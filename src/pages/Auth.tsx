
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm, { LoginFormValues } from '@/components/auth/LoginForm';
import SignupForm, { SignupFormValues } from '@/components/auth/SignupForm';
import RegistrationSuccess from '@/components/auth/RegistrationSuccess';
import SupabaseStatus from '@/components/auth/SupabaseStatus';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const { signIn, signUp, loading, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleLogin = async (formData: LoginFormValues) => {
    try {
      await signIn(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by signIn
    }
  };

  const handleSignup = async (formData: SignupFormValues) => {
    try {
      await signUp(
        formData.email, 
        formData.password, 
        { 
          first_name: formData.first_name, 
          last_name: formData.last_name 
        }
      );
      setRegistrationSuccess(true);
      // Automatically switch to login tab after successful registration
      setTimeout(() => {
        setActiveTab('login');
        setRegistrationSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Signup error:', error);
      // Error is handled by signUp
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('tab', value);
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Community Intelligence</h1>
          <p className="text-muted-foreground">HOA Management Platform</p>
          <SupabaseStatus />
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
              <LoginForm onSubmit={handleLogin} isLoading={loading} />
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            {registrationSuccess ? (
              <RegistrationSuccess />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join Community Intelligence today
                  </CardDescription>
                </CardHeader>
                <SignupForm onSubmit={handleSignup} isLoading={loading} />
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link to="#" className="underline text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="underline text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
