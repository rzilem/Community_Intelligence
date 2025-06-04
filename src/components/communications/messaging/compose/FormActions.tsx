
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onSend: () => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  canSend: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSend,
  onReset,
  isLoading,
  canSend
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button 
        variant="outline" 
        onClick={onReset}
      >
        Cancel
      </Button>
      <Button 
        disabled={!canSend || isLoading}
        onClick={onSend}
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </div>
  );
};

export default FormActions;
