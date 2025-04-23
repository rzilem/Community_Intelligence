
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, EyeOff, Send, Undo2 } from 'lucide-react';
import { MessageFormActionsProps } from '@/types/message-form-types';

const FormActions: React.FC<MessageFormActionsProps> = ({
  isSubmitting,
  canSubmit,
  isScheduled,
  onSubmit,
  onReset,
  onPreviewToggle
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
      >
        <Undo2 className="mr-2 h-4 w-4" />
        Reset
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={onPreviewToggle}
      >
        {isScheduled ? (
          <>
            <EyeOff className="mr-2 h-4 w-4" />
            Edit Message
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </>
        )}
      </Button>
      
      <Button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? (
          'Processing...'
        ) : isScheduled ? (
          <>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Message
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
