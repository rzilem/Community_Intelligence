
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Lead } from '@/types/lead-types';
import { 
  User, 
  Building2, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock, 
  Paperclip 
} from 'lucide-react';

import LeadDetailsTab from './tabs/LeadDetailsTab';
import LeadAssociationTab from './tabs/LeadAssociationTab';
import LeadCommunicationTab from './tabs/LeadCommunicationTab';
import LeadHistoryTab from './tabs/LeadHistoryTab';
import LeadDocumentsTab from './tabs/LeadDocumentsTab';
import LeadNotesTabContainer from './tabs/LeadNotesTabContainer';
import AttachmentsTab from '../tabs/AttachmentsTab';

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
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <LeadDetailsTab lead={lead} />
        </TabsContent>
        
        <TabsContent value="association" className="mt-6">
          <LeadAssociationTab lead={lead} />
        </TabsContent>
        
        <TabsContent value="communication" className="mt-6">
          <LeadCommunicationTab />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          <LeadNotesTabContainer lead={lead} onSaveNotes={onSaveNotes} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <LeadHistoryTab />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <LeadDocumentsTab />
        </TabsContent>
        
        <TabsContent value="attachments" className="mt-6">
          <AttachmentsTab lead={lead} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadDetailTabs;
