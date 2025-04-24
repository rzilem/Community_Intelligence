
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';

interface TransactionBatchOperationsProps {
  selectedTransactions: string[];
  onOperationComplete: () => void;
}

export const TransactionBatchOperations: React.FC<TransactionBatchOperationsProps> = ({
  selectedTransactions,
  onOperationComplete,
}) => {
  const { toast } = useToast();
  const createBatch = useSupabaseCreate('transaction_batches');
  const updateTransactions = useSupabaseUpdate('bank_transactions');

  const handleBatchOperation = async (operationType: string) => {
    try {
      // Create a new batch
      const { data: batch } = await createBatch.mutateAsync({
        operation_type: operationType,
        total_transactions: selectedTransactions.length,
        status: 'processing'
      });

      // Update all selected transactions with the batch ID
      await Promise.all(
        selectedTransactions.map(id =>
          updateTransactions.mutateAsync({
            id,
            data: { 
              batch_id: batch.id,
              category: operationType === 'categorize' ? 'pending_categorization' : undefined,
              is_reconciled: operationType === 'reconcile' ? true : undefined
            }
          })
        )
      );

      toast({
        title: "Batch Operation Started",
        description: `Processing ${selectedTransactions.length} transactions`
      });

      onOperationComplete();
    } catch (error) {
      console.error('Error in batch operation:', error);
      toast({
        title: "Error",
        description: "Failed to process batch operation",
        variant: "destructive"
      });
    }
  };

  if (selectedTransactions.length === 0) return null;

  return (
    <div className="flex gap-2 p-4 bg-muted/50 rounded-lg mb-4">
      <Button
        variant="outline"
        onClick={() => handleBatchOperation('categorize')}
      >
        Categorize Selected ({selectedTransactions.length})
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBatchOperation('reconcile')}
      >
        Reconcile Selected ({selectedTransactions.length})
      </Button>
    </div>
  );
};
