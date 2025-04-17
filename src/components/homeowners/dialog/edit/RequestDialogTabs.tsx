
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestDialogTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}

const RequestDialogTabs: React.FC<RequestDialogTabsProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="email">Original Email</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default RequestDialogTabs;
