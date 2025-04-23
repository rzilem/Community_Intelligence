import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useJournalEntries } from '@/hooks/accounting/useJournalEntries';
import { useTransactionPaymentData } from '@/hooks/accounting/useTransactionPaymentData';
import { useAssociationContext } from '@/contexts/association-context';
import PageTemplate from '@/components/layout/PageTemplate';
import { DollarSign, Plus } from 'lucide-react';
import { JournalEntry, GLAccount } from '@/types/accounting-types'; // Fixed import
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';

interface GLAccountBalanceChartProps {
  accounts: GLAccount[];
}

const GLAccountBalanceChart: React.FC<GLAccountBalanceChartProps> = ({ accounts }) => {
  // Implementation of the chart component
  return (
    <div className="h-[200px] flex items-center justify-center">
      <p className="text-muted-foreground">GL Account balance visualization</p>
    </div>
  );
};

const AccountingDashboard = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { currentAssociation } = useAssociationContext();
  const { entries, isLoading: entriesLoading } = useJournalEntries(currentAssociation?.id);
  const { transactions, payments, journalEntries } = useTransactionPaymentData(currentAssociation?.id);
  
  // Use the accounts from useGLAccounts
  const { accounts: glAccounts } = useGLAccounts(currentAssociation?.id);
  
  return (
    <PageTemplate
      title="Accounting Dashboard"
      icon={<DollarSign className="h-8 w-8" />}
      description="Overview of accounting and financial data for your association."
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,500</div>
            <p className="text-xs text-muted-foreground">+10.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,200</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,200</div>
            <p className="text-xs text-muted-foreground">5 invoices pending</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="accounts" className="mt-6">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">GL Account Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <GLAccountBalanceChart accounts={glAccounts || []} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Account Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">Account distribution visualization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Description</th>
                          <th className="text-left pb-2">Category</th>
                          <th className="text-right pb-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 5).map((transaction) => (
                          <tr key={transaction.id} className="border-b">
                            <td className="py-2">{transaction.date}</td>
                            <td className="py-2">{transaction.description}</td>
                            <td className="py-2">{transaction.category}</td>
                            <td className={`py-2 text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="rounded-md border">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Reference</th>
                          <th className="text-left pb-2">Description</th>
                          <th className="text-right pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journalEntries.slice(0, 5).map((entry) => (
                          <tr key={entry.id} className="border-b">
                            <td className="py-2">{entry.date}</td>
                            <td className="py-2">{entry.reference}</td>
                            <td className="py-2">{entry.description}</td>
                            <td className="py-2 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                entry.status === 'posted' ? 'bg-green-100 text-green-800' : 
                                entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No journal entries found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default AccountingDashboard;
