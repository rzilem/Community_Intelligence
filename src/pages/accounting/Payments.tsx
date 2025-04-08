
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Wallet, Filter, Download, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Payment {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'scheduled' | 'processed' | 'failed' | 'pending';
  method: 'check' | 'ach' | 'credit' | 'wire';
  associationName: string;
  category: string;
}

const mockPayments: Payment[] = [
  {
    id: 'PAY-1001',
    vendor: 'Sunset Landscaping LLC',
    amount: 2450.00,
    date: '2025-04-10',
    status: 'scheduled',
    method: 'ach',
    associationName: 'Oakridge Estates',
    category: 'Landscaping'
  },
  {
    id: 'PAY-1002',
    vendor: 'Aquatic Pool Services',
    amount: 895.00,
    date: '2025-04-05',
    status: 'processed',
    method: 'check',
    associationName: 'Lakeside Community',
    category: 'Pool Maintenance'
  },
  {
    id: 'PAY-1003',
    vendor: 'Security Systems Inc.',
    amount: 1200.00,
    date: '2025-04-02',
    status: 'processed',
    method: 'credit',
    associationName: 'Highland Towers',
    category: 'Security'
  },
  {
    id: 'PAY-1004',
    vendor: 'Quality Cleaning Co.',
    amount: 750.00,
    date: '2025-04-01',
    status: 'processed',
    method: 'ach',
    associationName: 'Oakridge Estates',
    category: 'Cleaning'
  },
  {
    id: 'PAY-1005',
    vendor: 'Pike Electrical Services',
    amount: 1675.00,
    date: '2025-03-28',
    status: 'processed',
    method: 'check',
    associationName: 'Highland Towers',
    category: 'Repairs'
  },
  {
    id: 'PAY-1006',
    vendor: 'Mountain State Water',
    amount: 2100.00,
    date: '2025-04-15',
    status: 'scheduled',
    method: 'ach',
    associationName: 'Riverside Gardens',
    category: 'Utilities'
  },
  {
    id: 'PAY-1007',
    vendor: 'ABC Insurance Group',
    amount: 3500.00,
    date: '2025-04-08',
    status: 'pending',
    method: 'wire',
    associationName: 'Pine Valley HOA',
    category: 'Insurance'
  }
];

const getStatusBadge = (status: Payment['status']) => {
  switch (status) {
    case 'processed':
      return <Badge className="bg-green-500">Processed</Badge>;
    case 'scheduled':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const getMethodBadge = (method: Payment['method']) => {
  switch (method) {
    case 'ach':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">ACH</Badge>;
    case 'check':
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Check</Badge>;
    case 'credit':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Credit Card</Badge>;
    case 'wire':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-500">Wire</Badge>;
    default:
      return <Badge variant="outline">Other</Badge>;
  }
};

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = 
      payment.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTemplate 
      title="Payments" 
      icon={<Wallet className="h-8 w-8" />}
      description="Process and track payments to vendors and service providers."
    >
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Track, process, and manage vendor payments across all associations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="outgoing" className="w-full">
              <TabsList>
                <TabsTrigger value="outgoing">Outgoing Payments</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value="outgoing" className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[160px]">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="processed">Processed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <TooltipButton tooltip="Export payments as CSV">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </TooltipButton>
                    <TooltipButton variant="default" tooltip="Create a new payment">
                      <PlusCircle className="h-4 w-4 mr-2" /> New Payment
                    </TooltipButton>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Association</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                            No payments found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.id}</TableCell>
                            <TableCell>{payment.vendor}</TableCell>
                            <TableCell>{payment.associationName}</TableCell>
                            <TableCell>{payment.category}</TableCell>
                            <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{getMethodBadge(payment.method)}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipButton size="sm" variant="ghost" tooltip="View payment details">
                                  View
                                </TooltipButton>
                                {payment.status === 'scheduled' && (
                                  <TooltipButton size="sm" variant="outline" className="border-amber-500 text-amber-500" tooltip="Edit payment details">
                                    Edit
                                  </TooltipButton>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="pt-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
                  <h3 className="text-lg font-medium">Payment History</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="90days">
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Time Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="12months">Last 12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <TooltipButton tooltip="Export payment history as CSV">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </TooltipButton>
                  </div>
                </div>
                
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium text-muted-foreground">Total Payments</div>
                        <div className="text-2xl font-bold mt-1">$14,570.00</div>
                        <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium text-muted-foreground">Payment Count</div>
                        <div className="text-2xl font-bold mt-1">32</div>
                        <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium text-muted-foreground">Average Payment</div>
                        <div className="text-2xl font-bold mt-1">$455.31</div>
                        <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium text-muted-foreground">Top Category</div>
                        <div className="text-2xl font-bold mt-1">Landscaping</div>
                        <div className="text-xs text-muted-foreground mt-1">$5,250.00 (36%)</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground mb-4">Payment method breakdown for the period:</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-20 bg-blue-100 rounded-md flex flex-col items-center justify-center">
                          <div className="text-lg font-bold text-blue-700">48%</div>
                          <div className="text-xs text-muted-foreground">ACH</div>
                        </div>
                        <div className="h-20 bg-gray-100 rounded-md flex flex-col items-center justify-center">
                          <div className="text-lg font-bold text-gray-700">32%</div>
                          <div className="text-xs text-muted-foreground">Check</div>
                        </div>
                        <div className="h-20 bg-amber-100 rounded-md flex flex-col items-center justify-center">
                          <div className="text-lg font-bold text-amber-700">15%</div>
                          <div className="text-xs text-muted-foreground">Credit Card</div>
                        </div>
                        <div className="h-20 bg-emerald-100 rounded-md flex flex-col items-center justify-center">
                          <div className="text-lg font-bold text-emerald-700">5%</div>
                          <div className="text-xs text-muted-foreground">Wire</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">Showing {filteredPayments.length} of {mockPayments.length} payments</p>
            <Button variant="outline" size="sm">
              View all payment history
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default Payments;
