
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import { useLocation, useNavigate } from 'react-router-dom';

// Simplified content components to prevent import errors
const MessagingContent = () => (
  <div className="p-6 border rounded-lg">
    <h3 className="text-lg font-medium mb-4">Messaging</h3>
    <p className="text-muted-foreground">Messaging functionality is being loaded...</p>
  </div>
);

const AnnouncementsContent = () => (
  <div className="p-6 border rounded-lg">
    <h3 className="text-lg font-medium mb-4">Announcements</h3>
    <p className="text-muted-foreground">Announcements functionality is being loaded...</p>
  </div>
);

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

  // Memoize tab content components
  const messagingContent = useMemo(() => 
    activeTab === 'messaging' ? <MessagingContent /> : null, 
    [activeTab]
  );
  
  const announcementsContent = useMemo(() => 
    activeTab === 'announcements' ? <AnnouncementsContent /> : null, 
    [activeTab]
  );

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
          {messagingContent}
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-6">
          {announcementsContent}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default React.memo(Communications);
