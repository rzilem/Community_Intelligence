
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { JournalEntry, GLAccount } from '@/types/accounting-types';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { useAuth } from '@/contexts/auth/useAuth';
import { LoadingState } from '@/components/ui/loading-state';
import { JournalEntryForm } from './JournalEntryForm';
import { JournalEntryLineItems } from './JournalEntryLineItems';

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
    return Math.abs(totalDebits - totalCredits) < 0.001;
  }, { message: 'Total debits must equal total credits' }),
});

export interface JournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  entry?: JournalEntry;
  accounts?: GLAccount[];
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
            <JournalEntryForm form={form} />
            <JournalEntryLineItems form={form} accounts={accounts} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
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
