import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  const { user, profile, loading } = useAuth();
  
  console.log('AppLayout: user =', user?.id, 'profile =', !!profile, 'loading =', loading);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Allow access if user exists OR if we have a demo profile
  if (!user && !profile) {
    console.log('AppLayout: No user or profile found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col bg-slate-50">
          <TopNavigation />
          <div className="flex-1 p-6 overflow-auto bg-slate-50">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;