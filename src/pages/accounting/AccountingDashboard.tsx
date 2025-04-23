
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import TransactionsSection from '@/components/accounting/TransactionsSection';
import PaymentsSection from '@/components/accounting/PaymentsSection';
import JournalEntriesSection from '@/components/accounting/JournalEntriesSection';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { useJournalEntries, JournalEntry } from '@/hooks/accounting/useJournalEntries';
import { FinancialReportView } from '@/components/accounting/reports/FinancialReportView';
import { ArrowRight, BarChart3, BookOpen, CreditCard, DollarSign } from 'lucide-react';
import { GLAccountBalanceChart } from '@/components/accounting/GLAccountBalanceChart';
import { AiQueryInput } from '@/components/ai/AiQueryInput';

// Mock data for demonstration
import { mockPayments, mockTransactions, mockJournalEntries } from '@/utils/mock-data';

const AccountingDashboard = () => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { accounts, isLoading: isLoadingAccounts } = useGLAccounts({
    associationId: currentAssociation?.id,
    includeMaster: true,
  });

  return (
    <PageTemplate
      title="Accounting Dashboard"
      icon={<DollarSign className="h-8 w-8" />}
      description="Manage your association's financial records and transactions"
    >
      <div className="mb-6">
        <AiQueryInput 
          placeholder="Ask about accounting data or financial insights..." 
          compact={true}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Revenue"
              value="$45,289.00"
              change={+12.5}
              icon={<DollarSign className="h-5 w-5" />}
              linkText="View details"
              linkHref="/accounting/gl-accounts"
            />
            <SummaryCard
              title="Total Expenses"
              value="$32,478.00"
              change={+3.2}
              icon={<CreditCard className="h-5 w-5" />}
              linkText="View details"
              linkHref="/accounting/gl-accounts"
            />
            <SummaryCard
              title="Outstanding Invoices"
              value="$7,842.00"
              change={-2.4}
              icon={<BookOpen className="h-5 w-5" />}
              linkText="View invoices"
              linkHref="/accounting/invoice-queue"
            />
            <SummaryCard
              title="This Month's Budget"
              value="$12,000.00"
              progress={75}
              icon={<BarChart3 className="h-5 w-5" />}
              linkText="View budget"
              linkHref="/accounting/budget-planning"
            />
          </div>

          {/* GL Account Balances */}
          <Card>
            <CardHeader>
              <CardTitle>GL Account Balances</CardTitle>
              <CardDescription>Overview of key account balances</CardDescription>
            </CardHeader>
            <CardContent>
              <GLAccountBalanceChart />
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.slice(0, 5).map((transaction, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3">{transaction.description}</td>
                        <td className={`py-3 text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-right">
                  <Button variant="link" className="text-primary" onClick={() => setActiveTab('transactions')}>
                    View all transactions
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Vendor</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.slice(0, 5).map((payment, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3">{payment.vendor}</td>
                        <td className="py-3 text-right">${payment.amount.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-right">
                  <Button variant="link" className="text-primary" onClick={() => setActiveTab('payments')}>
                    View all payments
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsSection transactions={mockTransactions} />
        </TabsContent>

        <TabsContent value="journal">
          <JournalEntriesSection journalEntries={mockJournalEntries} associationId={currentAssociation?.id} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsSection payments={mockPayments} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>View key financial statements and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="balance-sheet">
                <TabsList className="mb-6">
                  <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                  <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
                  <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                </TabsList>
                
                <TabsContent value="balance-sheet">
                  <FinancialReportView 
                    associationId={currentAssociation?.id || ''}
                    reportType="balance-sheet"
                  />
                </TabsContent>
                
                <TabsContent value="income-statement">
                  <FinancialReportView 
                    associationId={currentAssociation?.id || ''}
                    reportType="income-statement"
                  />
                </TabsContent>
                
                <TabsContent value="cash-flow">
                  <FinancialReportView 
                    associationId={currentAssociation?.id || ''}
                    reportType="cash-flow"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  progress?: number;
  icon: React.ReactNode;
  linkText?: string;
  linkHref?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  progress,
  icon,
  linkText,
  linkHref
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% from last month
              </p>
            )}
            {progress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-1.5 bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{progress}% of budget used</p>
              </div>
            )}
            {linkText && linkHref && (
              <Button variant="link" className="text-primary p-0 mt-2 h-auto" asChild>
                <a href={linkHref}>
                  {linkText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountingDashboard;
