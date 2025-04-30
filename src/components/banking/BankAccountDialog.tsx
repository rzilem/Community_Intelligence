
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BankAccountForm from './BankAccountForm';
import { BankAccount } from './BankAccountTable';

interface BankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account?: BankAccount;
  onSubmit: (data: Partial<BankAccount>) => void;
}

const BankAccountDialog: React.FC<BankAccountDialogProps> = ({
  isOpen,
  onClose,
  account,
  onSubmit,
}) => {
  const isEditMode = !!account;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we'd get form data and pass to onSubmit
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Partial<BankAccount> = {
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      routingNumber: formData.get('routingNumber') as string,
      balance: parseFloat(formData.get('initialBalance') as string) || 0,
      accountType: formData.get('accountType') as string,
      institution: formData.get('institution') as string,
    };
    
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Bank Account' : 'Add New Bank Account'}
          </DialogTitle>
        </DialogHeader>

        <BankAccountForm 
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountDialog;
