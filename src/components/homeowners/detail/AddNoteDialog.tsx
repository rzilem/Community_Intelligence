
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { NoteType } from './types';
import { useAuth } from '@/contexts/auth/useAuth';
import { toast } from 'sonner';

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote?: (note: Omit<NoteType, 'date'>) => void;
  homeownerId: string;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  isOpen,
  onClose,
  onAddNote,
  homeownerId
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!homeownerId) {
        throw new Error('Homeowner ID is required');
      }

      // Determine author name from user if available
      let authorName = 'Staff';
      
      // Safely access user profile data, handling the case where it might not exist
      if (user && 'profile' in user) {
        const userProfile = user.profile || {};
        const firstName = userProfile.first_name || '';
        const lastName = userProfile.last_name || '';
        
        if (firstName || lastName) {
          authorName = `${firstName} ${lastName}`.trim();
        }
      }

      const noteData: Omit<NoteType, 'date'> = {
        type: 'manual',
        author: authorName,
        content: noteContent
      };

      if (onAddNote) {
        await onAddNote(noteData);
      }

      // Clear the form and close dialog
      setNoteContent('');
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
          <DialogDescription>
            Add a note about this homeowner. Notes are visible to all staff members.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="note-content" className="mb-2 block">
            Note Content
          </Label>
          <Textarea
            id="note-content"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter note details here..."
            className="min-h-[150px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !noteContent.trim()}>
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
