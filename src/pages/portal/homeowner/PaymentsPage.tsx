
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { CreditCard, Calendar, Download, Clock, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

const PaymentsPage = () => {
  const recentPayments = [
    { id: 1, date: '09/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Paid' },
    { id: 2, date: '08/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Paid' },
    { id: 3, date: '07/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Paid' },
    { id: 4, date: '06/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Paid' },
  ];

  const upcomingPayments = [
    { id: 1, date: '10/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Due' },
    { id: 2, date: '11/01/2023', amount: 150, type: 'Monthly Assessment', status: 'Upcoming' },
  ];

  return (
    <PortalPageLayout 
      title="Payments & Assessments" 
      icon={<CreditCard className="h-6 w-6" />}
      description="Manage your association payments and view payment history"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$150.00</p>
                <p className="text-xs text-muted-foreground">Due on Oct 1, 2023</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Year-to-Date Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$1,350.00</p>
                <p className="text-xs text-muted-foreground">9 payments in 2023</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">••••4242</p>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Make a Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">One-Time Payment</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Make a single payment to your HOA account</p>
                    <Button>Pay Now</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Set Up Autopay</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Schedule recurring payments to avoid late fees</p>
                    <Button variant="outline">Set Up Autopay</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Payments</CardTitle>
                <Button variant="ghost" size="sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.type}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={payment.status === 'Due' ? 'text-red-500 font-medium' : 'text-gray-500'}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'Due' && <Button size="sm">Pay Now</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment History</CardTitle>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.type}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.status}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default PaymentsPage;
