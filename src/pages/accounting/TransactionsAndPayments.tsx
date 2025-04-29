
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CreditCard, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionsSection from '@/components/accounting/TransactionsSection';
import PaymentsSection from '@/components/accounting/PaymentsSection';
import JournalEntriesSection from '@/components/accounting/JournalEntriesSection';
import { useTransactionPaymentData } from '@/hooks/accounting/useTransactionPaymentData';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { showToast } from '@/utils/toast-helpers';
import { useSupabaseQuery } from '@/hooks/supabase';

const TransactionsAndPayments = () => {
  const [mainTab, setMainTab] = useState('transactions');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const { transactions, payments, journalEntries, updatePaymentStatus } = useTransactionPaymentData(selectedAssociationId);

  // Fetch approved invoices that need payment
  const { data: approvedInvoices } = useSupabaseQuery(
    'invoices',
    {
      select: '*',
      filter: [
        { column: 'status', value: 'approved', operator: 'eq' },
        { column: 'payment_id', value: null, operator: 'is' }
      ]
    }
  );

  // Process approved invoices into scheduled payments
  useEffect(() => {
    if (approvedInvoices && approvedInvoices.length > 0) {
      console.log('Found approved invoices that need payment scheduling:', approvedInvoices);
      // In a real implementation, this would create payment records in the database
    }
  }, [approvedInvoices]);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleProcessPayment = (paymentId: string) => {
    // Update the payment status to processed
    updatePaymentStatus(paymentId, 'processed');
    
    // Show success message
    showToast.success("Payment Processed", `Payment ${paymentId} has been successfully processed.`);
  };

  return (
    <PageTemplate 
      title="Transactions & Payments" 
      icon={<CreditCard className="h-8 w-8" />}
      description="Manage all financial transactions, vendor payments, and journal entries."
    >
      <div className="mb-6">
        <AssociationSelector 
          onAssociationChange={handleAssociationChange}
          initialAssociationId={selectedAssociationId}
          label="Filter by Association"
        />
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <TransactionsSection transactions={transactions} />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentsSection 
            payments={payments} 
            onProcessPayment={handleProcessPayment}
          />
        </TabsContent>
        
        <TabsContent value="journal-entries">
          <JournalEntriesSection 
            journalEntries={journalEntries} 
            associationId={selectedAssociationId} 
          />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default TransactionsAndPayments;
