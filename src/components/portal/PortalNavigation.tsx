
import React, { useEffect, useState } from 'react';
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
  Star,
  UserCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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
  const { translateText, preferredLanguage } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Default navigation item titles
  const defaultTitles = {
    dashboard: 'Dashboard',
    payments: 'Payments',
    requests: 'Requests',
    calendarEvents: 'Calendar & Events',
    directory: 'Directory',
    documents: 'Documents',
    myProfile: 'My Profile',
    communityPulse: 'Community Pulse',
    homeowners: 'Homeowners',
    bankAccounts: 'Bank Accounts',
    knowledgeBase: 'Knowledge Base',
    emailCommunity: 'Email Community',
    bidsOpportunities: 'Bids & Opportunities',
    invoicesPayments: 'Invoices & Payments',
    vendorStatus: 'Vendor Status',
    portalNavigation: 'Portal Navigation'
  };

  // Translate navigation items when language changes
  useEffect(() => {
    const translateNavItems = async () => {
      if (preferredLanguage === 'en') {
        setTranslations(defaultTitles);
        return;
      }
      
      try {
        const translated: Record<string, string> = {};
        for (const [key, text] of Object.entries(defaultTitles)) {
          translated[key] = await translateText(text);
        }
        setTranslations(translated);
      } catch (error) {
        console.error('Error translating navigation items:', error);
        setTranslations(defaultTitles); // Fallback to default English titles
      }
    };
    
    translateNavItems();
  }, [preferredLanguage, translateText]);

  // Define navigation items for each portal type
  const homeownerNavItems: NavItem[] = [
    { title: translations.dashboard || defaultTitles.dashboard, path: '/portal/homeowner', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.payments || defaultTitles.payments, path: '/portal/homeowner/payments', icon: <CreditCard className="h-5 w-5" /> },
    { title: translations.requests || defaultTitles.requests, path: '/portal/homeowner/requests', icon: <FileText className="h-5 w-5" /> },
    { title: translations.calendarEvents || defaultTitles.calendarEvents, path: '/portal/homeowner/calendar', icon: <Calendar className="h-5 w-5" /> },
    { title: translations.directory || defaultTitles.directory, path: '/portal/homeowner/directory', icon: <Users className="h-5 w-5" /> },
    { title: translations.documents || defaultTitles.documents, path: '/portal/homeowner/documents', icon: <File className="h-5 w-5" /> },
    { title: translations.myProfile || defaultTitles.myProfile, path: '/portal/homeowner/profile', icon: <UserCircle className="h-5 w-5" /> },
  ];

  const boardNavItems: NavItem[] = [
    { title: translations.dashboard || defaultTitles.dashboard, path: '/portal/board', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.communityPulse || defaultTitles.communityPulse, path: '/portal/board/community-pulse', icon: <Activity className="h-5 w-5" /> },
    { title: translations.homeowners || defaultTitles.homeowners, path: '/portal/board/homeowners', icon: <Users className="h-5 w-5" /> },
    { title: translations.bankAccounts || defaultTitles.bankAccounts, path: '/portal/board/bank-accounts', icon: <Building className="h-5 w-5" /> },
    { title: translations.knowledgeBase || defaultTitles.knowledgeBase, path: '/portal/board/knowledge-base', icon: <BookOpen className="h-5 w-5" /> },
    { title: translations.emailCommunity || defaultTitles.emailCommunity, path: '/portal/board/email', icon: <Mail className="h-5 w-5" /> },
    { title: translations.myProfile || defaultTitles.myProfile, path: '/portal/board/profile', icon: <UserCircle className="h-5 w-5" /> },
  ];

  const vendorNavItems: NavItem[] = [
    { title: translations.dashboard || defaultTitles.dashboard, path: '/portal/vendor', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.bidsOpportunities || defaultTitles.bidsOpportunities, path: '/portal/vendor/bids', icon: <FileText className="h-5 w-5" /> },
    { title: translations.invoicesPayments || defaultTitles.invoicesPayments, path: '/portal/vendor/invoices', icon: <CreditCard className="h-5 w-5" /> },
    { title: translations.vendorStatus || defaultTitles.vendorStatus, path: '/portal/vendor/status', icon: <Star className="h-5 w-5" /> },
    { title: translations.myProfile || defaultTitles.myProfile, path: '/portal/vendor/profile', icon: <UserCircle className="h-5 w-5" /> },
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
      <h2 className="font-semibold mb-4 text-lg">{translations.portalNavigation || 'Portal Navigation'}</h2>
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
