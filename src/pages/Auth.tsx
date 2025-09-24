
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm, { LoginFormValues } from '@/components/auth/LoginForm';
import SignupForm, { SignupFormValues } from '@/components/auth/SignupForm';
import RegistrationSuccess from '@/components/auth/RegistrationSuccess';
import SupabaseStatus from '@/components/auth/SupabaseStatus';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [bypassTimer, setBypassTimer] = useState(0);

  // Emergency bypass timer
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setBypassTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    setBypassTimer(0);
  }, [loading]);

  // Check for existing auth in browser storage
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const existingSession = localStorage.getItem('sb-eqbbnewrorxilukaocjx-auth-token');
        if (existingSession && window.location.pathname === '/auth') {
          console.log('🚀 Found existing auth session, redirecting...');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkExistingAuth();
  }, [navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (formData: LoginFormValues) => {
    try {
      console.log('🚀 Starting login process...');
      await signIn(formData.email, formData.password);
      console.log('🎉 Login successful, navigating to dashboard');
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by signIn
    }
  };

  const handleSignup = async (formData: SignupFormValues) => {
    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });
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
              
              {/* Emergency bypass button */}
              {bypassTimer > 3 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-sm text-red-600 mb-2">
                    Login stuck for {bypassTimer} seconds
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem('emergency_bypass', 'true');
                      window.location.href = '/emergency';
                    }}
                    className="text-red-600 underline text-sm hover:text-red-800"
                  >
                    Emergency Dashboard Access →
                  </button>
                </div>
              )}
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
