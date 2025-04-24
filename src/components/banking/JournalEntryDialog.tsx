
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { JournalEntry } from './JournalEntryTable';
import { useGLAccounts, getFormattedGLAccountLabel } from '@/hooks/accounting/useGLAccounts';
import { useAuth } from '@/contexts/auth/useAuth';
import { LoadingState } from '@/components/ui/loading-state';
import { GLAccount } from '@/types/accounting-types';

interface JournalEntryLineItem {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

const formSchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  reference: z.string().min(1, { message: 'Reference is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  lineItems: z.array(z.object({
    accountId: z.string().min(1, { message: 'Account is required' }),
    description: z.string(),
    debit: z.number().nonnegative(),
    credit: z.number().nonnegative(),
  })).refine(items => {
    const totalDebits = items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredits = items.reduce((sum, item) => sum + item.credit, 0);
    return Math.abs(totalDebits - totalCredits) < 0.001; // Allow for floating point precision issues
  }, { message: 'Total debits must equal total credits' }),
});

export interface JournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  entry?: JournalEntry;
  accounts?: GLAccount[]; // Add the accounts property to the interface
}

const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  entry,
  accounts: providedAccounts
}) => {
  const { currentAssociation } = useAuth();
  const { accounts: fetchedAccounts, isLoading } = useGLAccounts({
    associationId: currentAssociation?.id,
    includeMaster: true
  });

  // Use provided accounts if available, otherwise use fetched accounts
  const accounts = providedAccounts || fetchedAccounts;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: entry ? {
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      lineItems: []
    } : {
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      lineItems: [{ accountId: '', description: '', debit: 0, credit: 0 }]
    },
  });

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

  if (isLoading && !providedAccounts) {
    return (
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <LoadingState variant="spinner" text="Loading GL accounts..." className="py-10" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Journal Entry' : 'Create Journal Entry'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div></div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-3">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isBalanced}>
                {entry ? 'Update' : 'Create'} Journal Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
