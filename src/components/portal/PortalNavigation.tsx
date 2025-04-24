
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  Users, 
  File, 
  Building,
  Activity,
  BookOpen,
  LayoutDashboard,
  Mail,
  Truck,
  Star
} from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface PortalNavigationProps {
  portalType: 'homeowner' | 'board' | 'vendor';
}

export const PortalNavigation: React.FC<PortalNavigationProps> = ({ portalType }) => {
  const location = useLocation();

  const homeownerNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/portal/homeowner', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'Payments', path: '/portal/homeowner/payments', icon: <CreditCard className="h-5 w-5" /> },
    { title: 'Requests', path: '/portal/homeowner/requests', icon: <FileText className="h-5 w-5" /> },
    { title: 'Calendar & Events', path: '/portal/homeowner/calendar', icon: <Calendar className="h-5 w-5" /> },
    { title: 'Directory', path: '/portal/homeowner/directory', icon: <Users className="h-5 w-5" /> },
    { title: 'Documents', path: '/portal/homeowner/documents', icon: <File className="h-5 w-5" /> },
  ];

  const boardNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/portal/board', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'Community Pulse', path: '/portal/board/community-pulse', icon: <Activity className="h-5 w-5" /> },
    { title: 'Homeowners', path: '/portal/board/homeowners', icon: <Users className="h-5 w-5" /> },
    { title: 'Bank Accounts', path: '/portal/board/bank-accounts', icon: <Building className="h-5 w-5" /> },
    { title: 'Knowledge Base', path: '/portal/board/knowledge-base', icon: <BookOpen className="h-5 w-5" /> },
    { title: 'Email Community', path: '/portal/board/email', icon: <Mail className="h-5 w-5" /> },
  ];

  const vendorNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/portal/vendor', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'Bids & Opportunities', path: '/portal/vendor/bids', icon: <FileText className="h-5 w-5" /> },
    { title: 'Invoices & Payments', path: '/portal/vendor/invoices', icon: <CreditCard className="h-5 w-5" /> },
    { title: 'Vendor Status', path: '/portal/vendor/status', icon: <Star className="h-5 w-5" /> },
  ];

  let navItems: NavItem[] = [];
  
  switch(portalType) {
    case 'homeowner':
      navItems = homeownerNavItems;
      break;
    case 'board':
      navItems = boardNavItems;
      break;
    case 'vendor':
      navItems = vendorNavItems;
      break;
    default:
      navItems = homeownerNavItems;
  }

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4 text-lg">Portal Navigation</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors",
              location.pathname === item.path && "bg-gray-100 font-medium"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
