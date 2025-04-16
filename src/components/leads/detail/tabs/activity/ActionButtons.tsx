
import React from 'react';
import { Button } from '@/components/ui/button';
import { MailIcon, CalendarIcon, MessageSquareIcon, PlusIcon } from 'lucide-react';
import { useDialog } from '@/hooks/ui/useDialog';
import AddNoteDialog from './AddNoteDialog';
import { Lead } from '@/types/lead-types';

interface ActionButtonsProps {
  lead: Lead;
  onSaveNotes: (notes: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ lead, onSaveNotes }) => {
  const { isOpen, open, close } = useDialog(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <MailIcon className="h-4 w-4" />
          Send Email
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Schedule Meeting
        </Button>
        <Button variant="outline" className="flex items-center gap-2" onClick={open}>
          <MessageSquareIcon className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      <AddNoteDialog 
        isOpen={isOpen} 
        onClose={close} 
        lead={lead}
        onSaveNotes={onSaveNotes}
      />
    </>
  );
};

export default ActionButtons;
