
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Association, AssociationAIIssue } from '@/types/association-types';
import { GeneralInfoTab } from './GeneralInfoTab';
import { PropertiesTab } from './tabs/PropertiesTab';
import { FinancialsTab } from './tabs/FinancialsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { CommunicationsTab } from './tabs/CommunicationsTab';
import { MembersTab } from './tabs/MembersTab';
import { AssociationSettingsTab } from './AssociationSettingsTab';
import { AIAnalysisSection } from './AIAnalysisSection';

interface AssociationTabsProps {
  association: Association;
  aiIssues: AssociationAIIssue[];
  aiIssuesLoading?: boolean;
  aiIssuesError?: Error | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AssociationTabs: React.FC<AssociationTabsProps> = ({
  association,
  aiIssues,
  aiIssuesLoading = false,
  aiIssuesError = null,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="mt-6 space-y-6">
      {/* AI Analysis Section - Now with real data and loading/error states */}
      <AIAnalysisSection 
        aiIssues={aiIssues} 
        isLoading={aiIssuesLoading}
        error={aiIssuesError}
      />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 lg:w-full">
          <TabsTrigger value="details">General Info</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="h-[600px]">
          <GeneralInfoTab association={association} />
        </TabsContent>

        <TabsContent value="properties" className="h-[600px]">
          <PropertiesTab associationId={association.id} />
        </TabsContent>

        <TabsContent value="financials" className="h-[600px]">
          <FinancialsTab associationId={association.id} />
        </TabsContent>

        <TabsContent value="documents" className="h-[600px]">
          <DocumentsTab associationId={association.id} />
        </TabsContent>

        <TabsContent value="communications" className="h-[600px]">
          <CommunicationsTab associationId={association.id} />
        </TabsContent>

        <TabsContent value="members" className="h-[600px]">
          <MembersTab associationId={association.id} />
        </TabsContent>

        <TabsContent value="settings" className="h-[600px]">
          <AssociationSettingsTab association={association} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
