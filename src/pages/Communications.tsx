
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageTemplate from './PageTemplate';
import MessagingPage from './communications/Messaging';
import Announcements from './communications/Announcements';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('messaging');

  return (
    <PageTemplate title="Communications" icon={<MessageSquare className="h-8 w-8" />}>
      <Tabs defaultValue="messaging" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="messaging">
          <MessagingPage />
        </TabsContent>
        <TabsContent value="announcements">
          <Announcements />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Communications;
