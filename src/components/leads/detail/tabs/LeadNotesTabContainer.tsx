
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/lead-types';
import LeadNotesTab from '../LeadNotesTab';

interface LeadNotesTabContainerProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const LeadNotesTabContainer: React.FC<LeadNotesTabContainerProps> = ({ lead, onSaveNotes }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <LeadNotesTab lead={lead} onSaveNotes={onSaveNotes} />
      </CardContent>
    </Card>
  );
};

export default LeadNotesTabContainer;
