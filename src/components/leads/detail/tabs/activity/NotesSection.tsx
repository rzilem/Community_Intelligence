
import React, { useState } from 'react';
import { PlusIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { Lead } from '@/types/lead-types';

interface NotesSectionProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ lead, onSaveNotes }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onSaveNotes(lead.notes ? `${lead.notes}\n\n${new Date().toLocaleString()}: ${newNote}` : `${new Date().toLocaleString()}: ${newNote}`);
      setNewNote('');
      toast.success('Note added successfully');
    } else {
      toast.error('Note cannot be empty');
    }
  };

  return (
    <div className="mb-6">
      <div className="border rounded-md p-4 mb-4">
        <label htmlFor="new-note" className="block text-sm font-medium mb-2">Leave a Note</label>
        <Textarea 
          id="new-note"
          placeholder="Type your note here..." 
          value={newNote} 
          onChange={(e) => setNewNote(e.target.value)}
          className="mb-3 min-h-[100px]"
        />
        <Button onClick={handleAddNote} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Note
        </Button>
      </div>
      
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
