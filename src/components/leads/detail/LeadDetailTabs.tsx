
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from '@/types/lead-types';
import LeadInfoTab from './LeadInfoTab';
import LeadOriginalEmailTab from './LeadOriginalEmailTab';
import LeadNotesTab from './LeadNotesTab';
import LeadAttachmentsTab from './LeadAttachmentsTab';
import { getFormattedLeadAddressData } from './address-utils/data-utils';
import { Paperclip } from 'lucide-react';

interface LeadDetailTabsProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
  onAssociationUpdate: (associationData: Partial<Lead>) => void;
}

const LeadDetailTabs: React.FC<LeadDetailTabsProps> = ({ 
  lead, 
  onSaveNotes, 
  onAssociationUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  // Get formatted address data using utility function
  const addressData = getFormattedLeadAddressData(lead);
  
  return (
    <Tabs defaultValue="details" className="flex-1" value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="details">Lead Information</TabsTrigger>
        <TabsTrigger value="original">Original Email</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="attachments" className="flex items-center gap-1">
          <Paperclip className="h-4 w-4" />
          Attachments
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="flex-1 overflow-hidden">
        <LeadInfoTab 
          lead={lead} 
          formattedStreetAddress={addressData.formattedStreetAddress}
          cleanedCity={addressData.cleanedCity}
          zipCode={addressData.zipCode}
          fullAddress={addressData.fullAddress}
        />
      </TabsContent>
      
      <TabsContent value="original" className="flex-1 overflow-hidden">
        <LeadOriginalEmailTab lead={lead} />
      </TabsContent>
      
      <TabsContent value="notes" className="flex-1 overflow-hidden">
        <LeadNotesTab 
          lead={lead} 
          onSaveNotes={onSaveNotes}
        />
      </TabsContent>
      
      <TabsContent value="attachments" className="flex-1 overflow-hidden">
        <LeadAttachmentsTab lead={lead} />
      </TabsContent>
    </Tabs>
  );
};

export default LeadDetailTabs;
