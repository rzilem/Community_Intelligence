
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import MessagingPage from './communications/Messaging';
import Announcements from './communications/Announcements';
import { useLocation, useNavigate } from 'react-router-dom';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const location = useLocation();
  const navigate = useNavigate();

  // Set the correct active tab based on the current route - only run when location.pathname changes
  useEffect(() => {
    // Prevent multiple updates for the same path
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

  // Memoize the tab change handler to prevent recreation on every render
  const handleTabChange = useCallback((value: string) => {
    if (value === activeTab) return; // Prevent unnecessary navigation if tab hasn't changed
    
    setActiveTab(value);
    navigate(`/communications/${value}`);
  }, [activeTab, navigate]);

  // Memoize tab content components to prevent unnecessary re-renders
  const messagingContent = useMemo(() => activeTab === 'messaging' ? <MessagingPage /> : null, [activeTab]);
  const announcementsContent = useMemo(() => activeTab === 'announcements' ? <Announcements /> : null, [activeTab]);

  return (
    <PageTemplate title="Communications" icon={<MessageSquare className="h-8 w-8" />}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="messaging">
          {messagingContent}
        </TabsContent>
        <TabsContent value="announcements">
          {announcementsContent}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default React.memo(Communications);
