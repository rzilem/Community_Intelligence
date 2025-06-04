
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CreditCard, DollarSign, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BillingDashboard: React.FC = () => {
  return (
    <PageTemplate
      title="Billing Dashboard"
      icon={<CreditCard className="h-8 w-8" />}
      description="Manage HOA assessments, payments, and financial overview"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Assessment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$285.00</div>
              <p className="text-xs text-muted-foreground">Due January 1st</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$0.00</div>
              <p className="text-xs text-muted-foreground">All caught up!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,850.00</div>
              <p className="text-xs text-muted-foreground">10 payments made</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Current</div>
              <p className="text-xs text-muted-foreground">No late fees</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="statements">Statements</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2024-01-01', amount: '$285.00', method: 'Auto-Pay', status: 'Completed' },
                    { date: '2023-12-01', amount: '$285.00', method: 'Online Payment', status: 'Completed' },
                    { date: '2023-11-01', amount: '$285.00', method: 'Check', status: 'Completed' },
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.date}</p>
                        <p className="text-sm text-muted-foreground">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.amount}</p>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Regular Assessment</h3>
                      <p className="text-2xl font-bold text-blue-600">$285.00</p>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Special Assessment</h3>
                      <p className="text-2xl font-bold">$0.00</p>
                      <p className="text-sm text-muted-foreground">None active</p>
                    </div>
                  </div>
                  
                  <Button className="w-full">Make Payment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statements">
            <Card>
              <CardHeader>
                <CardTitle>Account Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { period: 'January 2024', date: '2024-01-31', balance: '$0.00' },
                    { period: 'December 2023', date: '2023-12-31', balance: '$0.00' },
                    { period: 'November 2023', date: '2023-11-30', balance: '$0.00' },
                  ].map((statement, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{statement.period}</p>
                        <p className="text-sm text-muted-foreground">Statement Date: {statement.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">Balance: {statement.balance}</p>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default BillingDashboard;
