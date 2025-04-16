
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { formatLeadName } from './lead-detail-utils';

interface LeadInfoTabProps {
  lead: Lead;
  formattedStreetAddress: string;
  cleanedCity: string;
  zipCode: string;
}

const LeadInfoTab: React.FC<LeadInfoTabProps> = ({ 
  lead, 
  formattedStreetAddress, 
  cleanedCity, 
  zipCode 
}) => {
  return (
    <ScrollArea className="h-[75vh]">
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Association Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground font-bold">Association Name:</div>
              <div>{lead.association_name || 'N/A'}</div>
              
              <div className="text-muted-foreground font-bold">Association Type:</div>
              <div>{lead.association_type || 'N/A'}</div>
              
              <div className="text-muted-foreground font-bold">Number of Units:</div>
              <div>{lead.number_of_units || 'N/A'}</div>
              
              <div className="text-muted-foreground font-bold">Current Management:</div>
              <div>{lead.current_management || 'N/A'}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Contact Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground font-bold">Name:</div>
              <div>{formatLeadName(lead)}</div>
              
              <div className="text-muted-foreground font-bold">Email:</div>
              <div>
                {lead.email ? (
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {lead.email}
                    <Mail size={14} />
                  </a>
                ) : 'N/A'}
              </div>
              
              <div className="text-muted-foreground font-bold">Phone:</div>
              <div>
                {lead.phone ? (
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {lead.phone}
                    <Phone size={14} />
                  </a>
                ) : 'N/A'}
              </div>
              
              <div className="text-muted-foreground font-bold">Company:</div>
              <div>{lead.company || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <div className="text-muted-foreground font-bold">Street Address:</div>
            <div className="col-span-2 text-left">
              {formattedStreetAddress || 'N/A'}
              {formattedStreetAddress && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedStreetAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline inline-flex items-center"
                >
                  Map It <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </div>
            
            {lead.address_line2 && (
              <>
                <div className="text-muted-foreground font-bold">Address Line 2:</div>
                <div className="col-span-2 text-left">{lead.address_line2}</div>
              </>
            )}
            
            <div className="text-muted-foreground font-bold">City:</div>
            <div className="col-span-2 text-left">{cleanedCity || 'N/A'}</div>
            
            <div className="text-muted-foreground font-bold">State:</div>
            <div className="col-span-2 text-left">{lead.state || 'N/A'}</div>
            
            <div className="text-muted-foreground font-bold">ZIP:</div>
            <div className="col-span-2 text-left">{zipCode || 'N/A'}</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Lead Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-muted-foreground font-bold">Source:</div>
            <div>{lead.source}</div>
            
            <div className="text-muted-foreground font-bold">Status:</div>
            <div className="capitalize">{lead.status}</div>
            
            <div className="text-muted-foreground font-bold">Created:</div>
            <div>{new Date(lead.created_at).toLocaleDateString()}</div>
            
            <div className="text-muted-foreground font-bold">Additional Requirements:</div>
            <div>{lead.additional_requirements || 'N/A'}</div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeadInfoTab;
