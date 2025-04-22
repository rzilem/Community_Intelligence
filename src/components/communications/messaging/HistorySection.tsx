
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageHistoryTable } from '@/components/communications/MessageHistoryTable';

interface HistorySectionProps {
  associationId: string;
}

const HistorySection: React.FC<HistorySectionProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = React.useState('all');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <MessageHistoryTable />
          </TabsContent>
          
          <TabsContent value="email">
            <MessageHistoryTable />
          </TabsContent>
          
          <TabsContent value="sms">
            <MessageHistoryTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistorySection;
