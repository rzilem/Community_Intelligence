
import React from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';

interface NotesSectionProps {
  lead: Lead;
}

const NotesSection: React.FC<NotesSectionProps> = ({ lead }) => {
  return (
    <div className="mb-6">
      {lead.notes && (
        <div className="border rounded-md overflow-hidden mb-4">
          <div className="flex items-center bg-muted/30 p-3 border-b">
            <div className="bg-white p-2 rounded-full mr-3">
              <MessageSquareIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-medium">Lead Notes</h4>
            </div>
          </div>
          <div className="p-4">
            <ScrollArea className="h-[200px]">
              <div className="whitespace-pre-wrap">{lead.notes}</div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
