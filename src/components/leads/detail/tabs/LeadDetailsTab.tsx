import React from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createGoogleMapsLink } from '../address-utils';
import { getFormattedLeadAddressData } from '../lead-detail-utils';

interface LeadDetailsTabProps {
  lead: Lead;
}

const LeadDetailsTab: React.FC<LeadDetailsTabProps> = ({ lead }) => {
  // Improve address formatting to handle various edge cases
  const formatAddress = () => {
    if (!lead.street_address) return '';

    // Clean up and format street address
    const streetAddress = lead.street_address.trim();
    
    // Combine city, state, and zip with proper spacing
    const cityStateZip = [
      lead.city?.trim(),
      lead.state?.trim(),
      lead.zip?.trim()
    ].filter(Boolean).join(', ');

    // Combine street address and city/state/zip
    return cityStateZip 
      ? `${streetAddress}, ${cityStateZip}` 
      : streetAddress;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                <dd>{lead.name}</dd>
              </div>
              {lead.first_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
                  <dd>{lead.first_name}</dd>
                </div>
              )}
              {lead.last_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
                  <dd>{lead.last_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{lead.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd>{lead.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                <dd>{lead.company || 'Not provided'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                <dd>{lead.source}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="capitalize">{lead.status}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd>{new Date(lead.created_at).toLocaleDateString()}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd>{new Date(lead.updated_at).toLocaleDateString()}</dd>
              </div>
              
              {lead.tracking_number && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Tracking Number</dt>
                  <dd>{lead.tracking_number}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Association Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Association Name</dt>
                <dd>{lead.association_name || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Association Type</dt>
                <dd>{lead.association_type || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Number of Units</dt>
                <dd>{lead.number_of_units || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Current Management</dt>
                <dd>{lead.current_management || 'Not provided'}</dd>
              </div>
              
              {/* Combined address information */}
              <div className="pt-4 border-t mt-2">
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="mt-1">
                  {formatAddress() ? (
                    <div className="flex items-center">
                      <span>{formatAddress()}</span>
                      {lead.street_address && (
                        <a 
                          href={createGoogleMapsLink(lead.street_address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          Map It
                        </a>
                      )}
                    </div>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadDetailsTab;
