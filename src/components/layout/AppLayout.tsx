import React, { useState } from 'react';
import { Outlet, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Search,
  BarChart,
  TrendingUp,
  BookOpen,
  MessageSquare,
  UserCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile, loading, signOut, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  console.log('🚀 AppLayout: Rendering, user:', !!user, 'loading:', loading, 'location:', location.pathname);

  // Show loading while checking authentication
  if (loading) {
    console.log('ℹ️ AppLayout: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    console.log('ℹ️ AppLayout: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('✅ AppLayout: User authenticated, rendering layout');

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'resident', 'maintenance', 'accountant']
    },
    {
      name: 'Lead Management',
      path: '/lead-management',
      icon: TrendingUp,
      roles: ['admin', 'manager'],
      submenu: [
        { name: 'Dashboard', path: '/lead-management/dashboard', icon: BarChart },
        { name: 'Proposals', path: '/lead-management/proposals', icon: FileText },
        { name: 'Email Campaigns', path: '/lead-management/email-campaigns', icon: MessageSquare },
        { name: 'Analytics', path: '/lead-management/analytics', icon: TrendingUp },
        { name: 'Onboarding', path: '/lead-management/onboarding', icon: UserCheck }
      ]
    },
    {
      name: 'Community Management',
      path: '/community-management',
      icon: Building,
      roles: ['admin', 'manager'],
      submenu: [
        { name: 'Associations', path: '/associations', icon: Building },
        { name: 'Homeowners', path: '/homeowners', icon: Users },
        { name: 'Bid Requests', path: '/community-management/bid-requests', icon: FileText },
        { name: 'Homeowner Requests', path: '/community-management/homeowner-requests', icon: MessageSquare },
        { name: 'Compliance', path: '/compliance', icon: UserCheck }
      ]
    },
    {
      name: 'Accounting',
      path: '/accounting',
      icon: DollarSign,
      roles: ['admin', 'manager', 'accountant'],
      submenu: [
        { name: 'Dashboard', path: '/accounting/dashboard', icon: BarChart },
        { name: 'Bank Accounts', path: '/accounting/bank-accounts', icon: Building },
        { name: 'Invoice Queue', path: '/accounting/invoice-queue', icon: FileText },
        { name: 'Transactions & Payments', path: '/accounting/transactions-payments', icon: DollarSign },
        { name: 'GL Accounts', path: '/accounting/gl-accounts', icon: BookOpen },
        { name: 'Budget Planning', path: '/accounting/budget-planning', icon: TrendingUp }
      ]
    },
    {
      name: 'Operations',
      path: '/operations',
      icon: Wrench,
      roles: ['admin', 'manager', 'maintenance'],
      submenu: [
        { name: 'Dashboard', path: '/operations/dashboard', icon: BarChart },
        { name: 'Vendors', path: '/operations/vendors', icon: Building },
        { name: 'Workflows', path: '/operations/workflows', icon: Settings },
        { name: 'Calendar', path: '/operations/calendar', icon: Calendar },
        { name: 'Letter Templates', path: '/operations/letter-templates', icon: FileText },
        { name: 'Print Queue', path: '/operations/print-queue', icon: FileText }
      ]
    },
    {
      name: 'Resale Management',
      path: '/resale-management',
      icon: TrendingUp,
      roles: ['admin', 'manager'],
      submenu: [
        { name: 'Overview', path: '/resale-management', icon: BarChart },
        { name: 'Certificate', path: '/resale-management/certificate', icon: FileText },
        { name: 'Docs Center', path: '/resale-management/docs-center', icon: BookOpen },
        { name: 'Calendar', path: '/resale-management/calendar', icon: Calendar },
        { name: 'Order Queue', path: '/resale-management/order-queue', icon: MessageSquare },
        { name: 'Analytics', path: '/resale-management/analytics', icon: TrendingUp }
      ]
    },
    {
      name: 'Communications',
      path: '/communications',
      icon: MessageSquare,
      roles: ['admin', 'manager', 'resident'],
      submenu: [
        { name: 'Messaging', path: '/communications/messaging', icon: MessageSquare },
        { name: 'Announcements', path: '/communications/announcements', icon: Bell }
      ]
    },
    {
      name: 'Records & Reports',
      path: '/records-reports',
      icon: FileText,
      roles: ['admin', 'manager', 'resident'],
      submenu: [
        { name: 'Documents', path: '/records-reports/documents', icon: FileText },
        { name: 'Reports', path: '/records-reports/reports', icon: BarChart }
      ]
    },
    {
      name: 'System',
      path: '/system',
      icon: Settings,
      roles: ['admin'],
      submenu: [
        { name: 'Settings', path: '/system/settings', icon: Settings },
        { name: 'Permissions', path: '/system/permissions', icon: UserCheck },
        { name: 'Data Management', path: '/system/data-management', icon: BookOpen },
        { name: 'Email Workflows', path: '/system/email-workflows', icon: MessageSquare },
        { name: 'Workflow Schedule', path: '/system/workflow-schedule', icon: Calendar }
      ]
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

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const hasActiveSubmenu = (item: any) => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem: any) => location.pathname === subItem.path);
  };

  const NavLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    const isActive = location.pathname === item.path || hasActiveSubmenu(item);
    
    if (item.submenu) {
      const sectionKey = item.path.replace('/', '');
      const isOpen = activeSection === sectionKey;
      
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleSection(sectionKey)}
            className={cn(
              "w-full text-left flex items-center justify-between py-2 px-3 rounded-md transition-colors",
              isOpen || isActive
                ? "text-white bg-white/10"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 text-xs">
                {item.submenu.length}
              </Badge>
            </div>
          </button>
          {isOpen && (
            <div className="pl-8 space-y-1">
              {item.submenu.map((subItem: any) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 text-sm rounded-md transition-colors",
                    location.pathname === subItem.path
                      ? "bg-blue-500/30 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={() => mobile && setSidebarOpen(false)}
                >
                  <subItem.icon size={18} />
                  <span>{subItem.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <Link
        to={item.path}
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive 
            ? "bg-blue-500/30 text-white" 
            : "text-white/80 hover:text-white hover:bg-white/10",
          mobile ? "w-full" : ""
        )}
        onClick={() => mobile && setSidebarOpen(false)}
      >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
      </Link>
    );
  };

  const UserProfile = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex items-center space-x-3 ${mobile ? 'p-4 border-t border-white/10' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback className="bg-blue-500 text-white">
          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="text-xs text-white/70 capitalize">
          {userRole}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10"
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-slate-700 rounded-lg flex items-center justify-center">
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
          <div className="flex flex-col flex-grow bg-gradient-to-b from-blue-900 via-blue-800 to-slate-800 border-r border-blue-700/30">
            <div className="flex items-center h-16 px-6 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-slate-300 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-blue-900">CI</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  Community Intelligence
                </span>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
            
            <div className="p-4 border-t border-white/10">
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-blue-900 via-blue-800 to-slate-800">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-slate-300 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-blue-900">CI</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      Community Intelligence
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {filteredNavItems.map((item) => (
                    <NavLink key={item.name} item={item} mobile />
                  ))}
                </nav>
                
                <UserProfile mobile />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <ErrorBoundary>
              {children || <Outlet />}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
