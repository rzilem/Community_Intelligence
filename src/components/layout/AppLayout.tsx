
import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  Home, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  Building, 
  Wrench,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppLayout = () => {
  const { user, profile, loading, signOut, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to auth if not authenticated (except for public routes)
  const publicRoutes = ['/auth', '/terms', '/privacy', '/'];
  if (!user && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/auth" replace />;
  }

  // Show auth page for unauthenticated users on public routes
  if (!user && publicRoutes.includes(location.pathname)) {
    return <Outlet />;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'resident', 'maintenance', 'accountant']
    },
    {
      name: 'Community Management',
      href: '/community-management',
      icon: Building,
      roles: ['admin', 'manager'],
      children: [
        { name: 'Bid Requests', href: '/community-management/bid-requests' },
        { name: 'Work Orders', href: '/community-management/work-orders' },
        { name: 'Amenities', href: '/community-management/amenities' }
      ]
    },
    {
      name: 'Financial Management',
      href: '/financial',
      icon: DollarSign,
      roles: ['admin', 'manager', 'accountant'],
      children: [
        { name: 'Accounting', href: '/financial/accounting' },
        { name: 'Assessments', href: '/financial/assessments' },
        { name: 'Payments', href: '/financial/payments' }
      ]
    },
    {
      name: 'Residents',
      href: '/residents',
      icon: Users,
      roles: ['admin', 'manager']
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      roles: ['admin', 'manager', 'resident']
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      roles: ['admin', 'manager', 'resident']
    },
    {
      name: 'Operations',
      href: '/operations',
      icon: Wrench,
      roles: ['admin', 'manager', 'maintenance']
    },
    {
      name: 'Administration',
      href: '/admin',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole || 'resident')
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const NavLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    const isActive = location.pathname === item.href || 
      (item.children && item.children.some((child: any) => location.pathname.startsWith(child.href)));
    
    return (
      <a
        href={item.href}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }
          ${mobile ? 'w-full' : ''}
        `}
        onClick={() => mobile && setSidebarOpen(false)}
      >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
      </a>
    );
  };

  const UserProfile = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex items-center space-x-3 ${mobile ? 'p-4 border-t' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback>
          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {userRole}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="p-2"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">CI</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        Community Intelligence
                      </span>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-1">
                    {filteredNavItems.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                  </nav>
                  
                  <UserProfile mobile />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">CI</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">CI</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">CI</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Community Intelligence
                </span>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
