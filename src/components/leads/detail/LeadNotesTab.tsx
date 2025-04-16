
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';

interface LeadNotesTabProps {
  lead: Lead;
}

const LeadNotesTab: React.FC<LeadNotesTabProps> = ({ lead }) => {
  return (
    <ScrollArea className="h-[70vh]">
      <div className="p-4">
        <div className="border rounded-md p-4 whitespace-pre-wrap">
          {lead.notes || 'No notes available for this lead.'}
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeadNotesTab;
