
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import { useLocation, useNavigate } from 'react-router-dom';
import MessagingPage from './communications/Messaging';
import AnnouncementsPage from './communications/Announcements';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const location = useLocation();
  const navigate = useNavigate();

  // Set the correct active tab based on the current route
  useEffect(() => {
    let newTab;
    if (location.pathname.includes('/communications/announcements')) {
      newTab = 'announcements';
    } else {
      newTab = 'messaging';
    }
    
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  // Handle tab changes
  const handleTabChange = useCallback((value: string) => {
    if (value === activeTab) return;
    
    setActiveTab(value);
    navigate(`/communications/${value}`);
  }, [activeTab, navigate]);

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
