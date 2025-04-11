
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralInfoTab } from './GeneralInfoTab';
import { PlaceholderTab } from './PlaceholderTab';
import { Association, AssociationAIIssue } from '@/types/association-types';
import MembersTab from './MembersTab';

interface AssociationTabsProps {
  association: Association;
  aiIssues: AssociationAIIssue[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const AssociationTabs: React.FC<AssociationTabsProps> = ({ 
  association, 
  aiIssues, 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <Tabs defaultValue="details" className="w-full mt-6" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <GeneralInfoTab association={association} aiIssues={aiIssues} />
      </TabsContent>
      
      <TabsContent value="financials">
        <PlaceholderTab title="Financial Information" />
      </TabsContent>
      
      <TabsContent value="properties">
        <PlaceholderTab title="Properties" />
      </TabsContent>
      
      <TabsContent value="documents">
        <PlaceholderTab title="Documents" />
      </TabsContent>
      
      <TabsContent value="members">
        <MembersTab associationId={association.id} />
      </TabsContent>
      
      <TabsContent value="communications">
        <PlaceholderTab title="Communications" />
      </TabsContent>
      
      <TabsContent value="settings">
        <PlaceholderTab title="Association Settings" />
      </TabsContent>
    </Tabs>
  );
};
