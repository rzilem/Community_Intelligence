
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionsSection from '@/components/accounting/TransactionsSection';
import PaymentsSection from '@/components/accounting/PaymentsSection';
import { useTransactionPaymentData } from '@/hooks/accounting/useTransactionPaymentData';
import AssociationSelector from '@/components/associations/AssociationSelector';

const TransactionsAndPayments = () => {
  const [mainTab, setMainTab] = useState('transactions');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const { transactions, payments } = useTransactionPaymentData(selectedAssociationId);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Transactions & Payments" 
      icon={<CreditCard className="h-8 w-8" />}
      description="Manage all financial transactions and vendor payments."
    >
      <div className="mb-6">
        <AssociationSelector 
          onAssociationChange={handleAssociationChange}
          initialAssociationId={selectedAssociationId}
          label="Filter by Association"
        />
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <TransactionsSection transactions={transactions} />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentsSection payments={payments} />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default TransactionsAndPayments;
