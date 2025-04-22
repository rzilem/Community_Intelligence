
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ComplianceForm from './ComplianceForm';
import { Compliance } from '@/types/compliance-types';

interface ComplianceDialogProps {
  open: boolean;
  onOpenChange: (success: boolean) => void;
  associationId?: string;
  defaultValues?: Compliance | null;
}

const ComplianceDialog: React.FC<ComplianceDialogProps> = ({
  open,
  onOpenChange,
  associationId,
  defaultValues
}) => {
  const isEditMode = !!defaultValues;
  
  const handleSuccess = () => {
    onOpenChange(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onOpenChange(false);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Compliance Issue' : 'Create New Compliance Issue'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the details of this compliance issue.'
              : 'Create a new compliance issue for a property.'}
          </DialogDescription>
        </DialogHeader>
        
        {associationId && (
          <ComplianceForm 
            associationId={associationId}
            defaultValues={defaultValues}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceDialog;
