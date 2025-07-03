import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AssociationSelector from '@/components/associations/AssociationSelector';

const AccountsPayable = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>();

  const mockAPItems = [
    {
      id: '1',
      vendor: 'Acme Landscaping',
      invoiceNumber: 'INV-2024-001',
      amount: 2500.00,
      dueDate: '2024-01-15',
      status: 'pending_approval',
      approvalStatus: 'requires_approval',
      glAccount: '5200 - Landscaping',
      invoiceDate: '2024-01-01',
      description: 'Monthly landscaping services'
    },
    {
      id: '2',
      vendor: 'Elite Pool Service',
      invoiceNumber: 'EPS-456',
      amount: 850.00,
      dueDate: '2024-01-20',
      status: 'approved',
      approvalStatus: 'approved',
      glAccount: '5300 - Pool Maintenance',
      invoiceDate: '2024-01-05',
      description: 'Pool cleaning and chemical balancing'
    },
    {
      id: '3',
      vendor: 'Security Systems Inc',
      invoiceNumber: 'SSI-789',
      amount: 1200.00,
      dueDate: '2024-01-10',
      status: 'overdue',
      approvalStatus: 'approved',
      glAccount: '5100 - Security Services',
      invoiceDate: '2023-12-15',
      description: 'Security system monitoring'
    }
  ];

  const mockPurchaseOrders = [
    {
      id: '1',
      poNumber: 'PO-2024-001',
      vendor: 'ABC Supply Co',
      amount: 5000.00,
      status: 'approved',
      requestedDate: '2024-01-01',
      deliveryDate: '2024-01-15',
      description: 'Building maintenance supplies'
    },
    {
      id: '2',
      poNumber: 'PO-2024-002',
      vendor: 'Pro Contractors LLC',
      amount: 15000.00,
      status: 'pending_approval',
      requestedDate: '2024-01-03',
      deliveryDate: '2024-01-20',
      description: 'Roof repair project'
    }
  ];

  const getStatusBadge = (status: string, type: 'ap' | 'approval' | 'po' = 'ap') => {
    if (type === 'approval') {
      switch (status) {
        case 'approved':
          return <Badge variant="success">Approved</Badge>;
        case 'requires_approval':
          return <Badge variant="warning">Requires Approval</Badge>;
        case 'rejected':
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="secondary">Pending</Badge>;
      }
    }
    
    if (type === 'po') {
      switch (status) {
        case 'approved':
          return <Badge variant="success">Approved</Badge>;
        case 'pending_approval':
          return <Badge variant="warning">Pending Approval</Badge>;
        case 'issued':
          return <Badge variant="outline">Issued</Badge>;
        case 'closed':
          return <Badge variant="secondary">Closed</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }

    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'approved':
        return <Badge variant="outline">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Open</Badge>;
    }
  };

  return (
    <PageTemplate 
      title="Accounts Payable" 
      icon={<FileText className="h-8 w-8" />}
      description="Manage vendor invoices, purchase orders, and payment approvals"
    >
      <div className="space-y-6">
        {/* Header with Association Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AssociationSelector onAssociationChange={setSelectedAssociationId} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <FileText className="h-4 w-4 mr-2" />
              Enter Invoice
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">$45,750</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ready to Pay</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Vendor Invoices</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="payments">Payment Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Invoices</CardTitle>
                <CardDescription>Manage and process vendor invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>GL Account</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAPItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.vendor}</TableCell>
                        <TableCell>{item.invoiceNumber}</TableCell>
                        <TableCell>${item.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{getStatusBadge(item.approvalStatus, 'approval')}</TableCell>
                        <TableCell className="text-sm">{item.glAccount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">View</Button>
                            {item.approvalStatus === 'requires_approval' && (
                              <Button size="sm">Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
                <CardDescription>Create and manage purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPurchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                        <TableCell>{po.vendor}</TableCell>
                        <TableCell>${po.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(po.status, 'po')}</TableCell>
                        <TableCell>{new Date(po.requestedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(po.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{po.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">View</Button>
                            {po.status === 'pending_approval' && (
                              <Button size="sm">Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Items requiring approval before processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAPItems
                    .filter(item => item.approvalStatus === 'requires_approval')
                    .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.vendor}</h3>
                          <Badge variant="warning">Requires Approval</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invoice: {item.invoiceNumber} | 
                          Amount: ${item.amount.toFixed(2)} | 
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          GL Account: {item.glAccount}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Queue</CardTitle>
                <CardDescription>Approved invoices ready for payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Payment processing coming soon</p>
                  <Button className="mt-4" onClick={() => {}}>
                    Process Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default AccountsPayable;