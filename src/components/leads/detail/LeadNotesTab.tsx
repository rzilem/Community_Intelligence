
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead-types';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LeadNotesTabProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const LeadNotesTab: React.FC<LeadNotesTabProps> = ({ lead, onSaveNotes }) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSaveNotes(notes);
    setIsEditing(false);
  };

  return (
    <ScrollArea className="h-[70vh]">
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea 
              className="min-h-[200px] w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about this lead..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Notes</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-4 whitespace-pre-wrap">
              {notes || 'No notes available for this lead.'}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Edit Notes</Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default LeadNotesTab;
