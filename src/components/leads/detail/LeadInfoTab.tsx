
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { formatLeadName, formatAdditionalRequirements } from './lead-detail-utils';
import AIBadge from '@/components/ui/ai-badge';
import { createGoogleMapsLink } from './address-utils';

interface LeadInfoTabProps {
  lead: Lead;
  formattedStreetAddress: string;
  cleanedCity: string;
  zipCode: string;
  fullAddress: string;
}

const LeadInfoTab: React.FC<LeadInfoTabProps> = ({
  lead,
  formattedStreetAddress,
  fullAddress
}) => {
  const Field: React.FC<{value: React.ReactNode; field: string}> = ({value, field}) => (
    <span className="flex items-center gap-1">
      {value}
      {lead.ai_confidence?.[field] && <AIBadge confidence={lead.ai_confidence[field]} />}
    </span>
  );
  return (
    <ScrollArea className="h-[75vh]">
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Association Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground font-bold">Association Name:</div>
              <div><Field value={lead.association_name || 'N/A'} field="association_name" /></div>
              
              <div className="text-muted-foreground font-bold">Association Type:</div>
              <div><Field value={lead.association_type || 'N/A'} field="association_type" /></div>
              
              <div className="text-muted-foreground font-bold">Number of Units:</div>
              <div><Field value={lead.number_of_units || 'N/A'} field="number_of_units" /></div>
              
              <div className="text-muted-foreground font-bold">Current Management:</div>
              <div><Field value={lead.current_management || 'N/A'} field="current_management" /></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Contact Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground font-bold">Name:</div>
              <div><Field value={formatLeadName(lead)} field="name" /></div>
              
              <div className="text-muted-foreground font-bold">Email:</div>
              <div>
                {lead.email ? (
                  <Field
                    field="email"
                    value={(
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {lead.email}
                        <Mail size={14} />
                      </a>
                    )}
                  />
                ) : 'N/A'}
              </div>
              
              <div className="text-muted-foreground font-bold">Phone:</div>
              <div>
                {lead.phone ? (
                  <Field
                    field="phone"
                    value={(
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {lead.phone}
                        <Phone size={14} />
                      </a>
                    )}
                  />
                ) : 'N/A'}
              </div>
              
              <div className="text-muted-foreground font-bold">Company:</div>
              <div><Field value={lead.company || 'N/A'} field="company" /></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Lead Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground font-bold">Source:</div>
              <div><Field value={lead.source} field="source" /></div>
              
              <div className="text-muted-foreground font-bold">Status:</div>
              <div className="capitalize"><Field value={lead.status} field="status" /></div>
              
              <div className="text-muted-foreground font-bold">Created:</div>
              <div><Field value={new Date(lead.created_at).toLocaleDateString()} field="created_at" /></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Address</h3>
              <div className="text-left">
                <Field
                  field="street_address"
                  value={(
                    <>
                      {fullAddress}
                      {formattedStreetAddress && (
                        <a
                          href={createGoogleMapsLink(formattedStreetAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline inline-flex items-center"
                        >
                          Map It <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Additional Requirements</h3>
            <div className="whitespace-pre-wrap">
              <Field
                field="additional_requirements"
                value={formatAdditionalRequirements(lead.additional_requirements)}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeadInfoTab;
