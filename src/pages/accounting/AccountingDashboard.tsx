
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart, ArrowUp, ArrowDown, DollarSign, PiggyBank, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TooltipButton from '@/components/ui/tooltip-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TreasurerDashboard from '@/components/accounting/TreasurerDashboard';
import FinancialAnalyticsDashboard from '@/components/accounting/FinancialAnalyticsDashboard';

// Mock data for charts
const monthlyFinancialsData = [
  { month: 'Jan', income: 21500, expenses: 17800, balance: 3700 },
  { month: 'Feb', income: 22100, expenses: 16900, balance: 5200 },
  { month: 'Mar', income: 21800, expenses: 18500, balance: 3300 },
  { month: 'Apr', income: 23500, expenses: 17200, balance: 6300 },
  { month: 'May', income: 22900, expenses: 19100, balance: 3800 },
  { month: 'Jun', income: 24100, expenses: 18300, balance: 5800 },
];

const assessmentCollectionData = [
  { name: 'Oakridge Estates', collected: 92, expected: 100 },
  { name: 'Lakeside Community', collected: 85, expected: 100 },
  { name: 'Highland Towers', collected: 78, expected: 100 },
  { name: 'Pine Valley HOA', collected: 95, expected: 100 },
  { name: 'Riverside Gardens', collected: 88, expected: 100 },
];

const recentTransactions = [
  { id: 'TX-1001', date: '2025-04-08', description: 'Monthly Assessment Payment - Unit 204', amount: 350, type: 'income' },
  { id: 'TX-1002', date: '2025-04-07', description: 'Landscaping Services', amount: 1250, type: 'expense' },
  { id: 'TX-1003', date: '2025-04-06', description: 'Pool Maintenance', amount: 450, type: 'expense' },
  { id: 'TX-1004', date: '2025-04-05', description: 'Monthly Assessment Payment - Unit 108', amount: 350, type: 'income' },
  { id: 'TX-1005', date: '2025-04-04', description: 'Late Fee Payment - Unit 312', amount: 50, type: 'income' },
];

const AccountingDashboard = () => {
  const associationId = 'demo-association-id'; // Replace with actual association ID from context

  return (
    <PageTemplate
      title="Accounting Dashboard"
      icon={<BarChart className="h-8 w-8" />}
      description="Financial overview and insights for your community associations."
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="treasurer">Treasurer View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-green-100 p-2">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">$24,850</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12% increase
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-red-100 p-2">
                <CreditCard className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">$18,320</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    5% increase
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessment Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-blue-100 p-2">
                <PiggyBank className="h-4 w-4 text-blue-600" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">87.6%</p>
                  <Badge className="bg-amber-500">Target: 95%</Badge>
                </div>
                <Progress value={87.6} className="h-1.5 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delinquency Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-amber-100 p-2">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">42 days</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    7 days improvement
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Financial Overview</CardTitle>
              <Tabs defaultValue="6months" className="w-[220px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="3months">3M</TabsTrigger>
                  <TabsTrigger value="6months">6M</TabsTrigger>
                  <TabsTrigger value="1year">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>Monthly income, expenses and balance trends</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={monthlyFinancialsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                <Line type="monotone" dataKey="balance" name="Balance" stroke="#1e40af" strokeWidth={2} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium truncate w-48">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Transactions</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Assessment Collection Status</CardTitle>
            <CardDescription>Current collection rates by community</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={assessmentCollectionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" name="Collected %" fill="#3b82f6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common accounting tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <TooltipButton className="w-full justify-start" tooltip="Process a new payment from a resident">
                <DollarSign className="w-4 h-4 mr-2" /> Record Payment
              </TooltipButton>
              
              <TooltipButton className="w-full justify-start" variant="outline" tooltip="Add a new invoice from a vendor">
                <CreditCard className="w-4 h-4 mr-2" /> Add Invoice
              </TooltipButton>
              
              <TooltipButton className="w-full justify-start" variant="outline" tooltip="Generate a financial report">
                <BarChart className="w-4 h-4 mr-2" /> Run Report
              </TooltipButton>
              
              <TooltipButton className="w-full justify-start" variant="outline" tooltip="View outstanding balances">
                <Clock className="w-4 h-4 mr-2" /> View Delinquencies
              </TooltipButton>
              
              <TooltipButton className="w-full justify-start" variant="outline" tooltip="Make budget adjustments">
                <PiggyBank className="w-4 h-4 mr-2" /> Budget Management
              </TooltipButton>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="treasurer">
          <TreasurerDashboard associationId={associationId} />
        </TabsContent>

        <TabsContent value="analytics">
          <FinancialAnalyticsDashboard associationId={associationId} />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default AccountingDashboard;
