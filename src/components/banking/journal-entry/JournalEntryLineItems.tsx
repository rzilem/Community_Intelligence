
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GLAccount } from '@/types/accounting-types';
import { getFormattedGLAccountLabel } from '@/hooks/accounting/useGLAccounts';
import { UseFormReturn } from 'react-hook-form';

interface JournalEntryLineItemsProps {
  form: UseFormReturn<any>;
  accounts: GLAccount[];
}

export const JournalEntryLineItems: React.FC<JournalEntryLineItemsProps> = ({ form, accounts }) => {
  const lineItems = form.watch('lineItems') || [];
  
  const addLineItem = () => {
    form.setValue('lineItems', [
      ...lineItems,
      { accountId: '', description: '', debit: 0, credit: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    form.setValue('lineItems', lineItems.filter((_, i) => i !== index));
  };

  const totalDebits = lineItems.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  const totalCredits = lineItems.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium mb-4">Line Items</h3>
      
      <div className="grid grid-cols-12 gap-2 mb-2 font-medium">
        <div className="col-span-3">Account</div>
        <div className="col-span-3">Description</div>
        <div className="col-span-2">Debit</div>
        <div className="col-span-2">Credit</div>
        <div className="col-span-2"></div>
      </div>
      
      {lineItems.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-3">
            <Select
              value={item.accountId}
              onValueChange={(value) => form.setValue(`lineItems.${index}.accountId`, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {getFormattedGLAccountLabel(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-3">
            <Input
              value={item.description}
              onChange={(e) => form.setValue(`lineItems.${index}.description`, e.target.value)}
              placeholder="Description"
            />
          </div>
          
          <div className="col-span-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={item.debit || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : 0;
                form.setValue(`lineItems.${index}.debit`, value);
                if (value > 0) {
                  form.setValue(`lineItems.${index}.credit`, 0);
                }
              }}
            />
          </div>
          
          <div className="col-span-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={item.credit || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : 0;
                form.setValue(`lineItems.${index}.credit`, value);
                if (value > 0) {
                  form.setValue(`lineItems.${index}.debit`, 0);
                }
              }}
            />
          </div>
          
          <div className="col-span-2 flex">
            {lineItems.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeLineItem(index)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
      
      <div className="grid grid-cols-12 gap-2 mt-4">
        <div className="col-span-3">
          <Button type="button" variant="outline" onClick={addLineItem}>
            Add Line Item
          </Button>
        </div>
        <div className="col-span-3"></div>
        <div className="col-span-2 font-medium text-right pr-4">
          ${totalDebits.toFixed(2)}
        </div>
        <div className="col-span-2 font-medium text-right pr-4">
          ${totalCredits.toFixed(2)}
        </div>
        <div className="col-span-2"></div>
      </div>
      
      <div className="grid grid-cols-12 gap-2 mt-2">
        <div className="col-span-3"></div>
        <div className="col-span-3 text-right font-medium">Difference:</div>
        <div className={`col-span-4 font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
          ${Math.abs(totalDebits - totalCredits).toFixed(2)} {isBalanced ? '(Balanced)' : '(Unbalanced)'}
        </div>
        <div className="col-span-2"></div>
      </div>
    </div>
  );
};
