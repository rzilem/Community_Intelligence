
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { BankAccount } from './BankAccountTable';

interface BankAccountFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: BankAccount;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  onSubmit,
  onCancel,
  isEditMode = false,
  initialData,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Account Name</label>
          <Input 
            id="name" 
            name="name"
            defaultValue={initialData?.name || ''}
            placeholder="Operating Account" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="institution" className="text-sm font-medium">Financial Institution</label>
          <Input 
            id="institution" 
            name="institution"
            defaultValue={initialData?.institution || ''}
            placeholder="Bank Name" 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">Account Number</label>
            <Input 
              id="accountNumber" 
              name="accountNumber"
              defaultValue={initialData?.accountNumber || ''}
              placeholder="••••••••1234" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="routingNumber" className="text-sm font-medium">Routing Number</label>
            <Input 
              id="routingNumber" 
              name="routingNumber"
              defaultValue={initialData?.routingNumber || ''}
              placeholder="123456789" 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="accountType" className="text-sm font-medium">Account Type</label>
            <Select name="accountType" defaultValue={initialData?.accountType || ''}>
              <SelectTrigger id="accountType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="reserve">Reserve</SelectItem>
                <SelectItem value="money_market">Money Market</SelectItem>
                <SelectItem value="cd">Certificate of Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="initialBalance" className="text-sm font-medium">
              {isEditMode ? 'Current Balance' : 'Initial Balance'}
            </label>
            <Input 
              id="initialBalance" 
              name="initialBalance"
              defaultValue={initialData?.balance || 0}
              placeholder="0.00" 
              type="number" 
              step="0.01" 
              min="0" 
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? 'Update Account' : 'Add Account'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default BankAccountForm;
