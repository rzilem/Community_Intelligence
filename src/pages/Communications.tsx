
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import MessagingPage from './communications/Messaging';
import Announcements from './communications/Announcements';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageProvider } from '@/contexts/message/MessageContext';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const location = useLocation();
  const navigate = useNavigate();

  // Set the correct active tab based on the current route
  useEffect(() => {
    if (location.pathname.includes('/communications/announcements')) {
      setActiveTab('announcements');
    } else {
      setActiveTab('messaging');
    }
  }, [location.pathname]);

  // Update the URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/communications/${value}`);
  };

  return (
    <PageTemplate title="Communications" icon={<MessageSquare className="h-8 w-8" />}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="messaging">
          <MessageProvider>
            <MessagingPage />
          </MessageProvider>
        </TabsContent>
        <TabsContent value="announcements">
          <Announcements />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Communications;
