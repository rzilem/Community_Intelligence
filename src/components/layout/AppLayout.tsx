
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  ChevronLeft, 
  ChevronUp, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Building,
  Users2,
  FileText,
  MessageSquare,
  ClipboardList,
  DollarSign,
  BarChart3,
  CreditCard,
  FileInvoice,
  Receipt,
  Wallet,
  BookOpen,
  BarChart,
  PiggyBank,
  Send,
  Bell as BellIcon,
  User,
  BarChart2,
  Calendar,
  Building2,
  Mail,
  LineChart,
  ClipboardCheck,
  Printer,
  Database,
  File,
  FileBarChart,
  ScrollText,
  Clipboard,
  CalendarCheck,
  CircleDollarSign,
  FileCode,
  ListOrdered,
  Settings as SettingsIcon,
  PuzzlePiece,
  SlidersHorizontal,
  MailCheck,
  Download,
  Clock,
  Network,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ElementType;
  submenu?: {
    name: string;
    path: string;
    icon: React.ElementType;
  }[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'community-management': false,
    'accounting': false,
    'communications': false,
    'lead-management': false,
    'operations': false,
    'records-reports': false,
    'resale-management': false,
    'system': false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainNavItems: NavItemProps[] = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
    },
    { 
      name: 'Community Management', 
      path: '/community-management', 
      icon: Building,
      submenu: [
        { name: 'Properties', path: '/properties', icon: Building },
        { name: 'Residents', path: '/residents', icon: Users2 },
        { name: 'Compliance', path: '/compliance', icon: Shield },
        { name: 'Communications', path: '/communications', icon: MessageSquare },
        { name: 'Bid Requests', path: '/bid-requests', icon: ClipboardList },
      ]
    },
    { 
      name: 'Accounting', 
      path: '/accounting', 
      icon: DollarSign,
      submenu: [
        { name: 'Dashboard', path: '/accounting/dashboard', icon: BarChart },
        { name: 'Bank Accounts', path: '/accounting/bank-accounts', icon: Building },
        { name: 'Invoice Queue', path: '/accounting/invoice-queue', icon: FileInvoice },
        { name: 'Transactions', path: '/accounting/transactions', icon: Receipt },
        { name: 'Payments', path: '/accounting/payments', icon: Wallet },
        { name: 'Journal Entries', path: '/accounting/journal-entries', icon: BookOpen },
        { name: 'GL Accounts', path: '/accounting/gl-accounts', icon: Database },
        { name: 'Financial Reports', path: '/accounting/financial-reports', icon: BarChart2 },
        { name: 'Budget Planning', path: '/accounting/budget-planning', icon: PiggyBank },
      ]
    },
    { 
      name: 'Communications', 
      path: '/communications', 
      icon: MessageSquare,
      submenu: [
        { name: 'Messaging', path: '/communications/messaging', icon: Send },
        { name: 'Announcements', path: '/communications/announcements', icon: BellIcon },
      ]
    },
    { 
      name: 'Lead Management', 
      path: '/lead-management', 
      icon: User,
      submenu: [
        { name: 'Leads Dashboard', path: '/lead-management/dashboard', icon: BarChart },
        { name: 'Proposals', path: '/lead-management/proposals', icon: FileText },
        { name: 'Email Campaigns', path: '/lead-management/email-campaigns', icon: Mail },
        { name: 'Analytics', path: '/lead-management/analytics', icon: LineChart },
        { name: 'Onboarding Wizard', path: '/lead-management/onboarding', icon: ClipboardCheck },
      ]
    },
    { 
      name: 'Operations', 
      path: '/operations', 
      icon: BarChart,
      submenu: [
        { name: 'Dashboard', path: '/operations/dashboard', icon: BarChart },
        { name: 'Calendar', path: '/operations/calendar', icon: Calendar },
        { name: 'Vendors', path: '/operations/vendors', icon: Building2 },
        { name: 'Letter Templates', path: '/operations/letter-templates', icon: File },
        { name: 'Workflows', path: '/operations/workflows', icon: FileBarChart },
        { name: 'Print Queue', path: '/operations/print-queue', icon: Printer },
      ]
    },
    { 
      name: 'Records & Reports', 
      path: '/records-reports', 
      icon: FileText,
      submenu: [
        { name: 'Records', path: '/records-reports/records', icon: Database },
        { name: 'Documents', path: '/records-reports/documents', icon: File },
        { name: 'Reports', path: '/records-reports/reports', icon: FileBarChart },
      ]
    },
    { 
      name: 'Resale Management', 
      path: '/resale-management', 
      icon: ScrollText,
      submenu: [
        { name: 'Resale Certificate', path: '/resale-management/certificate', icon: Clipboard },
        { name: 'Condo Questionnaire', path: '/resale-management/questionnaire', icon: ClipboardList },
        { name: 'Property Inspection', path: '/resale-management/inspection', icon: CalendarCheck },
        { name: 'Account Statements', path: '/resale-management/statements', icon: CircleDollarSign },
        { name: 'TREC Forms', path: '/resale-management/trec-forms', icon: FileCode },
        { name: 'Order Queue', path: '/resale-management/order-queue', icon: ListOrdered },
      ]
    },
    { 
      name: 'System', 
      path: '/system', 
      icon: SettingsIcon,
      submenu: [
        { name: 'Integrations', path: '/system/integrations', icon: PuzzlePiece },
        { name: 'Settings', path: '/system/settings', icon: SlidersHorizontal },
        { name: 'Email Workflows', path: '/system/email-workflows', icon: MailCheck },
        { name: 'Data Import & Export', path: '/system/data', icon: Download },
        { name: 'Workflow Schedule', path: '/system/workflow-schedule', icon: Clock },
        { name: 'Associations', path: '/system/associations', icon: Network },
        { name: 'Permissions', path: '/system/permissions', icon: Shield },
      ]
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const renderSubmenu = (items: NavItemProps['submenu']) => {
    if (!items) return null;
    
    return (
      <div className="pl-8 space-y-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 py-2 px-3 text-sm rounded-md",
              location.pathname === item.path
                ? "bg-sidebar-accent text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 py-2.5 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-lg text-white">Community<br />Intelligence</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2 px-2 space-y-1">
            {mainNavItems.map((item) => (
              <div key={item.path} className="space-y-1">
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSection(item.path.replace('/', ''))}
                      className={cn(
                        "w-full text-left flex items-center justify-between py-2 px-3 rounded-md",
                        openSections[item.path.replace('/', '')] || location.pathname.startsWith(item.path)
                          ? "bg-sidebar-accent text-white"
                          : "text-white/80 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon size={20} />
                        <span>{item.name}</span>
                      </div>
                      {openSections[item.path.replace('/', '')] ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                    {(openSections[item.path.replace('/', '')] || location.pathname.startsWith(item.path)) && 
                      renderSubmenu(item.submenu)
                    }
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "w-full flex items-center gap-2 py-2 px-3 rounded-md",
                      location.pathname === item.path
                        ? "bg-sidebar-accent text-white"
                        : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                    {item.name === 'Communications' && (
                      <Badge className="ml-auto bg-hoa-accent text-white">3</Badge>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-md text-white/80 hover:bg-white/10"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={cn(
          "flex flex-col w-full transition-all duration-300 ease-in-out",
          !isMobile && isSidebarOpen ? "md:ml-64" : ""
        )}
      >
        {/* Mobile header */}
        <header className="flex md:hidden items-center justify-between h-16 px-4 border-b bg-white">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          
          <div className="flex items-center">
            <h1 className="font-display font-bold text-xl text-hoa-blue">Community Intelligence</h1>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={20} />
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
