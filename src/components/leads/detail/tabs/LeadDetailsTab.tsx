
import React from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createGoogleMapsLink } from '../address-utils';
import { extractCity } from '../address-utils';

interface LeadDetailsTabProps {
  lead: Lead;
}

const LeadDetailsTab: React.FC<LeadDetailsTabProps> = ({ lead }) => {
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
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Street</dt>
                <dd>
                  {lead.street_address ? (
                    <a 
                      href={createGoogleMapsLink(lead.street_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {lead.street_address}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
              {lead.address_line2 && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address Line 2</dt>
                  <dd>{lead.address_line2}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">City</dt>
                <dd>{extractCity(lead.city, lead.street_address) || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">State</dt>
                <dd>{lead.state || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">ZIP</dt>
                <dd>{lead.zip || 'Not provided'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
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
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">
              {lead.additional_requirements 
                ? lead.additional_requirements 
                : lead.html_content 
                ? 'See original email for additional information.'
                : 'No additional requirements specified.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadDetailsTab;
