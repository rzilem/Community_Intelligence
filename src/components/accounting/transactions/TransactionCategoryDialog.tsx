
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';

interface TransactionCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  glAccounts: GLAccount[];
  currentCategory?: string;
  currentNotes?: string;
  currentGlAccountId?: string;
}

export const TransactionCategoryDialog: React.FC<TransactionCategoryDialogProps> = ({
  isOpen,
  onClose,
  transactionId,
  glAccounts,
  currentCategory,
  currentNotes,
  currentGlAccountId
}) => {
  const [category, setCategory] = React.useState(currentCategory || '');
  const [glAccountId, setGlAccountId] = React.useState(currentGlAccountId || '');
  const [notes, setNotes] = React.useState(currentNotes || '');

  const updateTransaction = useSupabaseUpdate('bank_transactions');

  const handleSave = async () => {
    try {
      await updateTransaction.mutateAsync({
        id: transactionId,
        data: {
          category,
          gl_account_id: glAccountId || null,
          notes,
          is_categorized: true
        }
      });
      
      toast.success('Transaction categorized successfully');
      onClose();
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      toast.error('Failed to categorize transaction');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={glAccountId}
              onValueChange={setGlAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GL Account" />
              </SelectTrigger>
              <SelectContent>
                {glAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
