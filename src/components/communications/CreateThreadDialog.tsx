
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Users } from 'lucide-react';
import { useCreateMessageThread } from '@/hooks/useMessages';

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associationId: string;
}

export default function CreateThreadDialog({
  open,
  onOpenChange,
  associationId
}: CreateThreadDialogProps) {
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const createThread = useCreateMessageThread();

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter(p => p !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) return;

    try {
      await createThread.mutateAsync({
        association_id: associationId,
        subject: subject.trim(),
        participants,
        initial_message: initialMessage.trim() || undefined,
      });
      
      // Reset form
      setSubject('');
      setInitialMessage('');
      setParticipants([]);
      setNewParticipant('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Message Thread</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter thread subject"
              required
            />
          </div>

          <div>
            <Label>Participants</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="Enter email address"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddParticipant}>
                <Users className="h-4 w-4" />
              </Button>
            </div>
            
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {participants.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(email)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="initialMessage">Initial Message (Optional)</Label>
            <Textarea
              id="initialMessage"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Start the conversation..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!subject.trim() || createThread.isPending}>
              {createThread.isPending ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
