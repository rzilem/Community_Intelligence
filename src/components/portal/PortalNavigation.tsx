
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

export interface NavigationTranslations {
  dashboard: string;
  payments: string;
  requests: string;
  calendarEvents: string;
  directory: string;
  documents: string;
  myProfile: string;
  communityPulse: string;
  homeowners: string;
  bankAccounts: string;
  knowledgeBase: string;
  emailCommunity: string;
  bidsOpportunities: string;
  invoicesPayments: string;
  vendorStatus: string;
  portalNavigation: string;
  [key: string]: string; // Add index signature to fix TypeScript error
}

export const PortalNavigation: React.FC<PortalNavigationProps> = ({ portalType }) => {
  const location = useLocation();
  const { translateTexts, preferredLanguage } = useTranslation();
  
  const defaultTitles: NavigationTranslations = {
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
  
  const [translations, setTranslations] = useState<NavigationTranslations>(defaultTitles);

  useEffect(() => {
    const translateNavItems = async () => {
      if (preferredLanguage === 'en') {
        setTranslations(defaultTitles);
        return;
      }
      
      try {
        const translatedTitles = await translateTexts(defaultTitles);
        setTranslations(translatedTitles);
      } catch (error) {
        console.error('Error translating navigation items:', error);
        setTranslations(defaultTitles);
      }
    };
    
    translateNavItems();
  }, [preferredLanguage, translateTexts, defaultTitles]);

  // Use the translations for navigation items
  const homeownerNavItems: NavItem[] = [
    { title: translations.dashboard, path: '/portal/homeowner', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.payments, path: '/portal/homeowner/payments', icon: <CreditCard className="h-5 w-5" /> },
    { title: translations.requests, path: '/portal/homeowner/requests', icon: <FileText className="h-5 w-5" /> },
    { title: translations.calendarEvents, path: '/portal/homeowner/calendar', icon: <Calendar className="h-5 w-5" /> },
    { title: translations.directory, path: '/portal/homeowner/directory', icon: <Users className="h-5 w-5" /> },
    { title: translations.documents, path: '/portal/homeowner/documents', icon: <File className="h-5 w-5" /> },
    { title: translations.myProfile, path: '/portal/homeowner/profile', icon: <UserCircle className="h-5 w-5" /> },
  ];

  const boardNavItems: NavItem[] = [
    { title: translations.dashboard, path: '/portal/board', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.communityPulse, path: '/portal/board/community-pulse', icon: <Activity className="h-5 w-5" /> },
    { title: translations.homeowners, path: '/portal/board/homeowners', icon: <Users className="h-5 w-5" /> },
    { title: translations.bankAccounts, path: '/portal/board/bank-accounts', icon: <Building className="h-5 w-5" /> },
    { title: translations.knowledgeBase, path: '/portal/board/knowledge-base', icon: <BookOpen className="h-5 w-5" /> },
    { title: translations.emailCommunity, path: '/portal/board/email', icon: <Mail className="h-5 w-5" /> },
    { title: translations.myProfile, path: '/portal/board/profile', icon: <UserCircle className="h-5 w-5" /> },
  ];

  const vendorNavItems: NavItem[] = [
    { title: translations.dashboard, path: '/portal/vendor', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: translations.bidsOpportunities, path: '/portal/vendor/bids', icon: <FileText className="h-5 w-5" /> },
    { title: translations.invoicesPayments, path: '/portal/vendor/invoices', icon: <CreditCard className="h-5 w-5" /> },
    { title: translations.vendorStatus, path: '/portal/vendor/status', icon: <Star className="h-5 w-5" /> },
    { title: translations.myProfile, path: '/portal/vendor/profile', icon: <UserCircle className="h-5 w-5" /> },
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
      <h2 className="font-semibold mb-4 text-lg">{translations.portalNavigation}</h2>
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
