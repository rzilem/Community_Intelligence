
import React, { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';
import AssociationPortalSelector from '@/components/portal/AssociationPortalSelector';
import LanguageSelector from '@/components/portal/LanguageSelector';
import { useTranslation } from '@/hooks/use-translation';
import { QuickLinksSection } from '@/components/portal/dashboard/QuickLinksSection';
import { CommunityUpdatesCard } from '@/components/portal/dashboard/CommunityUpdatesCard';
import { AIChatCard } from '@/components/portal/dashboard/AIChatCard';

export interface DashboardTranslations {
  welcomeBack: string;
  homeownerPortal: string;
  makePayment: string;
  submitRequest: string;
  calendar: string;
  viewDocuments: string;
  communityUpdates: string;
  latestAnnouncements: string;
  annualMeeting: string;
  annualMeetingDesc: string;
  poolClosing: string;
  poolClosingDesc: string;
  askCommunityIntel: string;
  getInstantAnswers: string;
  [key: string]: string; // Add index signature to fix TypeScript error
}

const HomeownerDashboard = () => {
  const { user, profile } = useAuth();
  const { translateTexts, preferredLanguage, translateVersion } = useTranslation();
  
  const defaultTexts: DashboardTranslations = {
    welcomeBack: 'Welcome back',
    homeownerPortal: 'Homeowner Portal',
    makePayment: 'Make a Payment',
    submitRequest: 'Submit a Request',
    calendar: 'Calendar',
    viewDocuments: 'View Documents',
    communityUpdates: 'Community Updates',
    latestAnnouncements: 'Latest announcements and news',
    annualMeeting: 'Annual Meeting Scheduled',
    annualMeetingDesc: 'October 15, 2023 at 7:00 PM in the Community Center',
    poolClosing: 'Pool Closing for Season',
    poolClosingDesc: 'The community pool will close for the season on September 30',
    askCommunityIntel: 'Ask Community Intelligence',
    getInstantAnswers: 'Get instant answers about your community'
  };
  
  const [translations, setTranslations] = useState<DashboardTranslations>(defaultTexts);

  const updateTranslations = useCallback(async () => {
    try {
      if (preferredLanguage === 'en') {
        setTranslations(defaultTexts);
        return;
      }
      
      console.log(`Updating translations for HomeownerDashboard to ${preferredLanguage}`);
      const newTranslations = await translateTexts<DashboardTranslations>(defaultTexts);
      console.log('New translations:', newTranslations);
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [preferredLanguage, translateTexts, defaultTexts]);

  // Update translations when language or translation version changes
  useEffect(() => {
    updateTranslations();
  }, [preferredLanguage, updateTranslations, translateVersion]);

  const handleLanguageChange = () => {
    // No need to do anything here, the hook handles this
  };

  const handleAssociationChange = () => {
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="container p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{translations.homeownerPortal}</h1>
            <p className="text-muted-foreground">
              {translations.welcomeBack}, {profile?.name || user?.email || 'Homeowner'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector onLanguageChange={handleLanguageChange} />
            <AssociationPortalSelector onAssociationChange={handleAssociationChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="homeowner" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <QuickLinksSection translations={translations} />
            <CommunityUpdatesCard translations={translations} />
            <AIChatCard translations={translations} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeownerDashboard;
