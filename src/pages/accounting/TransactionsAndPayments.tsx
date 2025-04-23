
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth';
import TransactionsSection from '@/components/accounting/TransactionsSection';
import PaymentsSection from '@/components/accounting/PaymentsSection';
import { Plus, FileText, CreditCard } from 'lucide-react';
import { Transaction, Payment } from '@/types/transaction-payment-types';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

// Import mock data for demonstration
import { mockTransactions, mockPayments } from '@/utils/mock-data';

const TransactionsAndPayments = () => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'transaction' | 'payment'>('transaction');

  const handleNewTransaction = () => {
    setDialogType('transaction');
    setIsDialogOpen(true);
  };

  const handleNewPayment = () => {
    setDialogType('payment');
    setIsDialogOpen(true);
  };

  const handleProcessPayment = (paymentId: string) => {
    console.log(`Processing payment: ${paymentId}`);
    // In a real implementation, this would update the payment status in the database
  };

  return (
    <PageTemplate
      title="Transactions & Payments"
      icon={<FileText className="h-8 w-8" />}
      description="Manage financial transactions and vendor payments"
    >
      <div className="mb-6">
        <AiQueryInput 
          placeholder="Search transactions or ask accounting questions..." 
          compact={true}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          {activeTab === 'transactions' && (
            <Button onClick={handleNewTransaction}>
              <Plus className="h-4 w-4 mr-1" />
              New Transaction
            </Button>
          )}
          {activeTab === 'payments' && (
            <Button onClick={handleNewPayment}>
              <Plus className="h-4 w-4 mr-1" />
              New Payment
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="transactions" className="p-0 mt-0">
        <TransactionsSection transactions={mockTransactions} />
      </TabsContent>

      <TabsContent value="payments" className="p-0 mt-0">
        <PaymentsSection 
          payments={mockPayments}
          onProcessPayment={handleProcessPayment}
        />
      </TabsContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'transaction' ? 'New Transaction' : 'New Payment'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'transaction' 
                ? 'Record a new financial transaction' 
                : 'Schedule a new vendor payment'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {dialogType === 'transaction' ? (
              <p className="text-center text-muted-foreground">
                Transaction form will be implemented here
              </p>
            ) : (
              <p className="text-center text-muted-foreground">
                Payment form will be implemented here
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="ml-2" variant="default">
              {dialogType === 'transaction' ? 'Record Transaction' : 'Schedule Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default TransactionsAndPayments;
