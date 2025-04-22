
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isPreviewMode: boolean;
  togglePreview: () => void;
  handleReset: () => void;
  handleSendMessage: () => void;
  canSend: boolean;
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  isPreviewMode,
  togglePreview,
  handleReset,
  handleSendMessage,
  canSend,
  isLoading
}) => {
  return (
    <div className="flex justify-between pt-4">
      <Button 
        variant="outline" 
        onClick={togglePreview}
      >
        {isPreviewMode ? 'Edit Message' : 'Preview with Sample Data'}
      </Button>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          Cancel
        </Button>
        <Button 
          disabled={!canSend || isLoading}
          onClick={handleSendMessage}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </div>
  );
};

export default FormActions;
