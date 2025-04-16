
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <Button onClick={() => {
          const notes = prompt('Enter notes:', lead.notes || '');
          if (notes !== null) {
            onSaveNotes(notes);
          }
        }}>
          Edit Notes
        </Button>
      </CardHeader>
      <CardContent>
        <LeadNotesTab lead={lead} />
      </CardContent>
    </Card>
  );
};

export default LeadNotesTabContainer;
