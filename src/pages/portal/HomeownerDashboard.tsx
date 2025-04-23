
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileText, Calendar, File } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { AiQueryInput } from '@/components/ai/AiQueryInput';
import { useAuth } from '@/contexts/auth';
import AssociationPortalSelector from '@/components/portal/AssociationPortalSelector';
import LanguageSelector from '@/components/portal/LanguageSelector';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

const HomeownerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { translateText, preferredLanguage } = useTranslation();
  const [translations, setTranslations] = useState({
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
  });

  // Translate all UI text when language changes
  useEffect(() => {
    const translateUI = async () => {
      const newTranslations = { ...translations };
      
      for (const key of Object.keys(translations)) {
        newTranslations[key] = await translateText(translations[key]);
      }
      
      setTranslations(newTranslations);
    };
    
    translateUI();
  }, [preferredLanguage]);

  // Handler for changing association
  const handleAssociationChange = (associationId: string) => {
    window.location.reload();
  };

  const quickLinks = [
    { 
      title: translations.makePayment, 
      path: '/portal/homeowner/payments', 
      icon: <CreditCard className="h-5 w-5" />, 
      color: 'bg-blue-100',
      onClickToast: () => toast.info(translations.makePayment, { description: 'Redirecting to payment options' })
    },
    { 
      title: translations.submitRequest, 
      path: '/portal/homeowner/requests', 
      icon: <FileText className="h-5 w-5" />, 
      color: 'bg-green-100',
      onClickToast: () => toast.info(translations.submitRequest, { description: 'Preparing request submission form' })
    },
    { 
      title: translations.calendar, 
      path: '/portal/homeowner/calendar', 
      icon: <Calendar className="h-5 w-5" />, 
      color: 'bg-purple-100' 
    },
    { 
      title: translations.viewDocuments, 
      path: '/portal/homeowner/documents', 
      icon: <File className="h-5 w-5" />, 
      color: 'bg-amber-100' 
    },
  ];

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
            <LanguageSelector />
            <AssociationPortalSelector onAssociationChange={handleAssociationChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PortalNavigation portalType="homeowner" />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Card 
                  key={link.path} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    link.onClickToast && link.onClickToast();
                    navigate(link.path);
                  }}
                >
                  <CardHeader className="p-4">
                    <div className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center mb-2`}>
                      {link.icon}
                    </div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{translations.communityUpdates}</CardTitle>
                <CardDescription>{translations.latestAnnouncements}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">{translations.annualMeeting}</p>
                    <p className="text-sm text-muted-foreground">{translations.annualMeetingDesc}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">{translations.poolClosing}</p>
                    <p className="text-sm text-muted-foreground">{translations.poolClosingDesc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{translations.askCommunityIntel}</CardTitle>
                <CardDescription>{translations.getInstantAnswers}</CardDescription>
              </CardHeader>
              <CardContent>
                <AiQueryInput />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeownerDashboard;
