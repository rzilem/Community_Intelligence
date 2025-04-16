
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';

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

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">HOA Management Made Simple</h2>
          <p className="text-xl text-gray-600 mb-8">
            Community Intelligence helps HOA managers and board members streamline operations,
            improve communication, and make data-driven decisions.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth?tab=login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button variant="outline" size="lg">Sign Up</Button>
            </Link>
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
