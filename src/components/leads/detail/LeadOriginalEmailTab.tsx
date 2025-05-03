
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';

interface LeadOriginalEmailTabProps {
  lead: Lead;
}

const LeadOriginalEmailTab: React.FC<LeadOriginalEmailTabProps> = ({ lead }) => {
  return (
    <ScrollArea className="h-[70vh]">
      <div className="p-4">
        <div className="border rounded-md">
          {lead.html_content ? (
            <iframe 
              srcDoc={lead.html_content} 
              title="Original Email" 
              className="w-full h-[65vh]" 
              sandbox="allow-same-origin"
            />
          ) : lead.email_content ? (
            <div className="p-4 whitespace-pre-wrap font-mono text-sm">
              {lead.email_content}
            </div>
          ) : (
            <div className="p-4 text-muted-foreground">No content available for this lead.</div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default LeadOriginalEmailTab;
