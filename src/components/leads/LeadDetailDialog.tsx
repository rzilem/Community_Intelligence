
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from '@/types/lead-types';
import LeadInfoTab from './detail/LeadInfoTab';
import LeadOriginalEmailTab from './detail/LeadOriginalEmailTab';
import LeadNotesTab from './detail/LeadNotesTab';
import LeadAttachmentsTab from './detail/LeadAttachmentsTab';
import { getFormattedLeadAddressData } from './detail/address-utils';
import { Paperclip } from 'lucide-react';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({ lead, open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!lead) return null;
  
  // Get formatted address data using utility function
  const addressData = getFormattedLeadAddressData(lead);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lead Details: {lead.association_name || lead.name}</DialogTitle>
        </DialogHeader>
        
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
            <LeadNotesTab lead={lead} />
          </TabsContent>
          
          <TabsContent value="attachments" className="flex-1 overflow-hidden">
            <LeadAttachmentsTab lead={lead} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
