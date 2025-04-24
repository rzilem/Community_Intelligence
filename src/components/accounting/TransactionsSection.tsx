import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import TransactionSummaryCards from './TransactionSummaryCards';
import { Transaction } from '@/types/transaction-payment-types';
import { TransactionBatchOperations } from './transactions/TransactionBatchOperations';
import { RecurringTransactionDialog } from './transactions/RecurringTransactionDialog';
import { RecurringTransactionsList } from './transactions/RecurringTransactionsList';

interface TransactionsSectionProps {
  transactions: Transaction[];
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(transaction => {
      if (selectedTab === 'all') return true;
      return transaction.type === selectedTab;
    });
  
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const handleBatchOperationComplete = () => {
    setSelectedTransactions([]);
  };
  
  return (
    <>
      <TransactionSummaryCards transactions={transactions} />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <TransactionFilters 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              date={date} 
              setDate={setDate} 
            />
            <div className="flex gap-2">
              <RecurringTransactionDialog />
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All Transactions
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {transactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="income">
                Income
                <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  {incomeTransactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="expense">
                Expenses
                <span className="ml-1.5 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                  {expenseTransactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionTable 
                transactions={filteredTransactions}
                selectedTransactions={selectedTransactions}
                onSelectionChange={setSelectedTransactions}
              />
            </TabsContent>
            <TabsContent value="income">
              <TransactionTable 
                transactions={filteredTransactions.filter(t => t.type === 'income')}
                selectedTransactions={selectedTransactions}
                onSelectionChange={setSelectedTransactions}
              />
            </TabsContent>
            <TabsContent value="expense">
              <TransactionTable 
                transactions={filteredTransactions.filter(t => t.type === 'expense')}
                selectedTransactions={selectedTransactions}
                onSelectionChange={setSelectedTransactions}
              />
            </TabsContent>
            
            <TabsContent value="recurring">
              <RecurringTransactionsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default TransactionsSection;
