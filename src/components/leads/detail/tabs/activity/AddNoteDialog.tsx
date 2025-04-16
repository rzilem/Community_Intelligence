
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/lead-types';
import { toast } from 'sonner';

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ 
  isOpen, 
  onClose, 
  lead, 
  onSaveNotes 
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Format the new note with timestamp
      const timestamp = new Date().toLocaleString();
      const formattedNote = lead.notes 
        ? `${lead.notes}\n\n${timestamp}: ${newNote}` 
        : `${timestamp}: ${newNote}`;
      
      // Save the note
      await onSaveNotes(formattedNote);
      
      // Reset form and close dialog
      setNewNote('');
      onClose();
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea 
            placeholder="Type your note here..." 
            value={newNote} 
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddNote} 
            disabled={isSubmitting || !newNote.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteDialog;
