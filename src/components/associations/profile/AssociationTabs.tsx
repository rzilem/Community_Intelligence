
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Association, AssociationAIIssue } from '@/types/association-types';
import { GeneralInfoTab } from './GeneralInfoTab';
import { PropertiesTab } from './tabs/PropertiesTab';
import { FinancialsTab } from './tabs/FinancialsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { CommunicationsTab } from './tabs/CommunicationsTab';
import MembersTab from '../../associations/profile/MembersTab'; // Fixed import path
import { AssociationSettingsTab } from './AssociationSettingsTab';
import { AIAnalysisSection } from './AIAnalysisSection';
import { toast } from 'sonner';

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
  // Add onSave function for the SettingsTab
  const handleSaveSettings = async (data: Partial<Association>) => {
    try {
      // In a real application, this would call an API to update the association
      // For now, we'll just show a success toast
      console.log('Saving association settings:', data);
      toast.success('Association settings updated successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving association settings:', error);
      toast.error('Failed to save association settings');
      return Promise.reject(error);
    }
  };

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
          <GeneralInfoTab association={association} aiIssues={aiIssues} />
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
          <AssociationSettingsTab 
            association={association} 
            onSave={handleSaveSettings} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
