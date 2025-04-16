
import React from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LeadAssociationTabProps {
  lead: Lead;
}

const LeadAssociationTab: React.FC<LeadAssociationTabProps> = ({ lead }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Association Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
  );
};

export default LeadAssociationTab;
