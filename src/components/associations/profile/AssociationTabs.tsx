
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralInfoTab } from './GeneralInfoTab';
import { PlaceholderTab } from './PlaceholderTab';
import { Association, AssociationAIIssue } from '@/types/association-types';
import MembersTab from './MembersTab';
import AssociationSettingsTab from './AssociationSettingsTab';
import { Settings } from 'lucide-react';
import { useSupabaseUpdate } from '@/hooks/supabase/use-supabase-update';

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
  const [settingsSaving, setSettingsSaving] = React.useState(false);

  // Use the Supabase update hook to save association settings
  const updateAssociationMutation = useSupabaseUpdate<Association>('associations', {
    showSuccessToast: true,
    invalidateQueries: [['associations'], [`association-${association.id}`]]
  });

  const handleSaveSettings = async (data: Partial<Association>) => {
    setSettingsSaving(true);
    try {
      await updateAssociationMutation.mutateAsync({
        id: association.id,
        data
      });
    } catch (error) {
      console.error('Error updating association settings:', error);
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full mt-6" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full max-w-4xl flex flex-wrap mb-6 border-b rounded-none bg-transparent p-0 h-auto">
        <TabsTrigger 
          value="details" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Details
        </TabsTrigger>
        <TabsTrigger 
          value="financials" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Financials
        </TabsTrigger>
        <TabsTrigger 
          value="properties" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Properties
        </TabsTrigger>
        <TabsTrigger 
          value="documents" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger 
          value="members" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Members
        </TabsTrigger>
        <TabsTrigger 
          value="communications" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          Communications
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </TabsTrigger>
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
        <AssociationSettingsTab 
          association={association} 
          onSave={handleSaveSettings}
          saving={settingsSaving}
        />
      </TabsContent>
    </Tabs>
  );
};
