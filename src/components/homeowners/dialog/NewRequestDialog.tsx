
import React from 'react';
import { Button } from '@/components/ui/button';
import { HomeownerRequestForm } from '@/components/homeowners/HomeownerRequestForm';

interface NewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewRequestDialog: React.FC<NewRequestDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Request</h2>
        <HomeownerRequestForm onSuccess={onSuccess} />
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewRequestDialog;
