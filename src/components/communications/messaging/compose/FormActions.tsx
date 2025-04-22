
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, EyeOff, Send, Undo2 } from 'lucide-react';

interface FormActionsProps {
  isPreviewMode: boolean;
  togglePreview: () => void;
  handleReset: () => void;
  handleSendMessage: () => void;
  canSend: boolean;
  isLoading: boolean;
  isScheduled?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  isPreviewMode,
  togglePreview,
  handleReset,
  handleSendMessage,
  canSend,
  isLoading,
  isScheduled = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleReset}
      >
        <Undo2 className="mr-2 h-4 w-4" />
        Reset
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={togglePreview}
      >
        {isPreviewMode ? (
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
        disabled={!canSend || isLoading}
        onClick={handleSendMessage}
      >
        {isLoading ? (
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
