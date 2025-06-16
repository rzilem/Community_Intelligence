
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import { useLocation, useNavigate } from 'react-router-dom';
import MessagingPage from './communications/Messaging';
import AnnouncementsPage from './communications/Announcements';
import { useAuth } from '@/contexts/auth';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  console.log('[Communications] Component render:', {
    activeTab,
    currentPath: location.pathname,
    user: user?.email,
    loading,
    isAuthenticated
  });

  // Set the correct active tab based on the current route
  useEffect(() => {
    let newTab;
    if (location.pathname.includes('/communications/announcements')) {
      newTab = 'announcements';
    } else {
      newTab = 'messaging';
    }
    
    console.log('[Communications] Setting tab based on route:', { currentPath: location.pathname, newTab });
    
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  // Handle tab changes
  const handleTabChange = useCallback((value: string) => {
    console.log('[Communications] Tab change requested:', { from: activeTab, to: value });
    
    if (value === activeTab) return;
    
    setActiveTab(value);
    navigate(`/communications/${value}`);
  }, [activeTab, navigate]);

  if (loading) {
    return (
      <PageTemplate 
        title="Communications" 
        icon={<MessageSquare className="h-8 w-8" />}
        description="Manage communications with residents and stakeholders"
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Loading communications...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Communications" 
      icon={<MessageSquare className="h-8 w-8" />}
      description="Manage communications with residents and stakeholders"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messaging" className="space-y-6">
          <MessagingPage />
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-6">
          <AnnouncementsPage />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default React.memo(Communications);
