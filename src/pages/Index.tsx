
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import HeroSection from '@/components/marketing/HeroSection';
import { logger } from '@/utils/client-logger';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);

  // Initialize logger
  useEffect(() => {
    logger.init();
    console.log('Index page loaded');
  }, []);

  // Add timeout for auth check
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⚠️ Index: Auth check timeout reached');
      setAuthCheckTimeout(true);
      setIsLoading(false);
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only redirect after auth is checked or timeout
    if (!loading || authCheckTimeout) {
      setIsLoading(false);
      if (user && !authCheckTimeout) {
        console.log('User authenticated, redirecting to dashboard');
        navigate('/dashboard');
      } else {
        console.log('No authenticated user found or timeout reached');
      }
    }
  }, [user, loading, navigate, authCheckTimeout]);

  // Render loading state until auth check is complete or timeout
  if (isLoading && !authCheckTimeout) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
          <div className="text-sm text-gray-500">
            Checking authentication status...
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setAuthCheckTimeout(true);
              setIsLoading(false);
            }}
          >
            Continue without waiting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Community Intelligence</h1>
          <div>
            {!user && (
              <Link to="/auth">
                <Button>Login / Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Manage Your HOA with Confidence</h2>
            <p className="text-lg text-gray-600 mb-8">
              Community Intelligence provides all the tools you need to efficiently manage homeowners associations,
              from resident communication to maintenance requests and financial tracking.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Resident Management</h3>
                <p>Keep track of all residents and their information in one centralized location.</p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Request Tracking</h3>
                <p>Efficiently track and respond to homeowner requests and maintenance issues.</p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Financial Management</h3>
                <p>Track assessments, payments, and manage your association's finances.</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/auth?tab=signup">
                <Button size="lg">Get Started Today</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Community Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
