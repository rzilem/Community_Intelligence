
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, CreditCard, FileText, AlertTriangle, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccountantDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,580</div>
            <p className="text-xs text-muted-foreground">15 accounts delinquent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">$12,450 total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+$8,540</div>
            <p className="text-xs text-muted-foreground">5% above budget</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Alerts</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    <span className="font-medium">Budget Overage</span>
                  </div>
                  <span className="text-xs text-red-500 font-bold">Critical</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Landscaping expenses exceeded budget by 12%</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium">Approval Needed</span>
                  </div>
                  <span className="text-xs text-amber-500 font-bold">Pending</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">$4,500 repair invoice requires board approval</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium">Reserve Fund Alert</span>
                  </div>
                  <span className="text-xs text-amber-500 font-bold">Warning</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Reserve fund below recommended threshold</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Alerts</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 5 financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Assessment Payment</p>
                  <p className="text-sm text-muted-foreground">Smith, Unit 301</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+$350.00</p>
                  <p className="text-xs text-muted-foreground">Jun 1, 2023</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Pool Service</p>
                  <p className="text-sm text-muted-foreground">Blue Waters Inc</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-$520.00</p>
                  <p className="text-xs text-muted-foreground">May 31, 2023</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">Late Fee</p>
                  <p className="text-sm text-muted-foreground">Jones, Unit 415</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+$25.00</p>
                  <p className="text-xs text-muted-foreground">May 30, 2023</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Landscaping</p>
                  <p className="text-sm text-muted-foreground">Green Thumb LLC</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-$1,250.00</p>
                  <p className="text-xs text-muted-foreground">May 28, 2023</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Transactions</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AccountantDashboardContent;
