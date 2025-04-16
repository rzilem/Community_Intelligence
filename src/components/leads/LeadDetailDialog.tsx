
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from '@/types/lead-types';
import LeadInfoTab from './detail/LeadInfoTab';
import LeadOriginalEmailTab from './detail/LeadOriginalEmailTab';
import LeadNotesTab from './detail/LeadNotesTab';
import { getFormattedLeadAddressData } from './detail/address-utils';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({ lead, open, onOpenChange }) => {
  if (!lead) return null;
  
  // Get formatted address data using utility function
  const { formattedStreetAddress, cleanedCity, zipCode, fullAddress } = getFormattedLeadAddressData(lead);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lead Details: {lead.association_name || lead.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1">
          <TabsList>
            <TabsTrigger value="details">Lead Information</TabsTrigger>
            <TabsTrigger value="original">Original Email</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <LeadInfoTab 
              lead={lead} 
              formattedStreetAddress={formattedStreetAddress}
              cleanedCity={cleanedCity}
              zipCode={zipCode}
              fullAddress={fullAddress}
            />
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <LeadOriginalEmailTab lead={lead} />
          </TabsContent>
          
          <TabsContent value="notes" className="flex-1 overflow-hidden">
            <LeadNotesTab lead={lead} />
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
