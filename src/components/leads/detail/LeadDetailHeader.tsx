
import React from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardContent } from '@/components/ui/card';
import BackToLeadsButton from './header/BackToLeadsButton';
import LeadInfoCards from './header/LeadInfoCards';
import LeadStatusButtons from './header/LeadStatusButtons';

interface LeadDetailHeaderProps {
  lead: Lead;
  onStatusChange: (status: Lead['status']) => void;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({ 
  lead, 
  onStatusChange
}) => {
  return (
    <>
      <BackToLeadsButton />

      <Card className="mb-6 shadow-md border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <LeadInfoCards lead={lead} />
          
          <LeadStatusButtons 
            currentStatus={lead.status} 
            onStatusChange={onStatusChange} 
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LeadDetailHeader;
