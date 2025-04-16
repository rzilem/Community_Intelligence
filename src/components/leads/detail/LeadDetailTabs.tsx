
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Lead } from '@/types/lead-types';
import { 
  User, 
  Building2, 
  FileText, 
  Activity
} from 'lucide-react';

import LeadDetailsTab from './tabs/LeadDetailsTab';
import LeadAssociationTab from './tabs/LeadAssociationTab';
import LeadDocumentsTab from './tabs/LeadDocumentsTab';
import ActivityFeedTab from './tabs/ActivityFeedTab';

interface LeadDetailTabsProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({ lead, onSaveNotes }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Lead Details
          </TabsTrigger>
          <TabsTrigger value="association" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Association
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <LeadDetailsTab lead={lead} />
        </TabsContent>
        
        <TabsContent value="association" className="mt-6">
          <LeadAssociationTab lead={lead} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <ActivityFeedTab lead={lead} onSaveNotes={onSaveNotes} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <LeadDocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadDetailTabs;
