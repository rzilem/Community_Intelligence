
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import HeroSection from '@/components/marketing/HeroSection';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect to dashboard
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
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
