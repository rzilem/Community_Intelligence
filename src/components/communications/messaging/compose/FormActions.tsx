
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Send, Trash2, Clock } from 'lucide-react';

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
    <div className="flex justify-between pt-4 border-t">
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={togglePreview}
          className="mr-2"
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
          variant="outline"
          onClick={handleReset}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Discard
        </Button>
      </div>
      
      <Button
        type="button"
        onClick={handleSendMessage}
        disabled={!canSend || isLoading}
      >
        {isScheduled ? (
          <>
            <Clock className="mr-2 h-4 w-4" />
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
