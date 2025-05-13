
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SupabaseDiagnostics from '@/components/auth/SupabaseDiagnostics';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  // Always initialize all hooks at the top level of the component, regardless of conditions
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'login');
  const [supabaseStatus, setSupabaseStatus] = useState('Checking connection...');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Setup forms - always initialize hooks unconditionally
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles' as any)
          .select('count')
          .limit(1);
          
        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus(`Connection error: ${error.message}`);
        } else {
          console.log('Supabase connected successfully', data);
          setSupabaseStatus('Connected to Supabase successfully');
        }
      } catch (err) {
        console.error('Unexpected error checking Supabase:', err);
        setSupabaseStatus(`Unexpected error: ${String(err)}`);
      }
    };

    checkConnection();
  }, []);

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
          first_name: formData.firstName, 
          last_name: formData.lastName 
        }
      );
      setRegistrationSuccess(true);
      // Automatically switch to login tab after successful registration
      setTimeout(() => {
        setActiveTab('login');
        setRegistrationSuccess(false);
        signupForm.reset();
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
          <div className="mt-2 p-2 bg-blue-50 text-sm rounded border border-blue-200">
            <p className="font-medium">Supabase Status: <span className={supabaseStatus.includes('error') ? 'text-red-500' : 'text-green-500'}>{supabaseStatus}</span></p>
            <Button 
              variant="link" 
              className="text-xs p-0 h-6"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
            </Button>
          </div>
        </div>
        
        {showDiagnostics && <SupabaseDiagnostics />}
        
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Button variant="link" className="h-auto p-0" size="sm" type="button">
                              Forgot Password?
                            </Button>
                          </div>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
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
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            {registrationSuccess ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Registration Successful!</CardTitle>
                  <CardDescription>
                    Your account has been created
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <p>Thank you for registering with Community Intelligence.</p>
                  <p>Please check your email for a confirmation link.</p>
                  <p className="text-sm text-muted-foreground">You will be redirected to the login page shortly.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join Community Intelligence today
                  </CardDescription>
                </CardHeader>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                </Form>
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
