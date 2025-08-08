import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import ExportUtilities from '@/components/accounting/ExportUtilities';
import { toast } from 'sonner';

const AccountsPayable = () => {
  const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;

  const { data: apItems = [], isLoading } = useSupabaseQuery<any[]>(
    'accounts_payable',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
      order: { column: 'due_date', ascending: true },
    },
    !!associationId
  );
  // Helpers and computed totals
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));

  const totalOutstanding = apItems.reduce((sum: number, i: any) => sum + Number(i.current_balance ?? 0), 0);

  const readyToPayCount = apItems.filter((i: any) => i.approval_status === 'approved' && (i.status === 'open' || i.status === 'partial')).length;
  const overdueCount = apItems.filter((i: any) => (i.status === 'open' || i.status === 'partial') && (((i.aging_days || 0) > 0) || (i.due_date && new Date(i.due_date) < new Date()))).length;

  const validateApItem = (item: any): string[] => {
    const errors: string[] = [];
    if (!item?.vendor_name || String(item.vendor_name).trim() === '') errors.push('Vendor is required');
    if (!item?.invoice_number || String(item.invoice_number).trim() === '') errors.push('Invoice number is required');
    if (item?.original_amount === undefined || Number(item.original_amount) <= 0) errors.push('Amount must be greater than 0');
    if (!item?.due_date) errors.push('Due date is required');
    return errors;
  };

  const handleApproveAp = (item: any) => {
    const errors = validateApItem(item);
    if (errors.length > 0) {
      toast.error(`Please fix before approval:\n- ${errors.join('\n- ')}`);
      return;
    }
    toast.success('All checks passed. Approval flow coming soon.');
  };

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
    <AppLayout>
      <PageTemplate 
        title="Accounts Payable" 
        icon={<FileText className="h-8 w-8" />}
        description="Manage vendor invoices, purchase orders, and payment approvals"
      >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">{isLoading ? '—' : formatCurrency(totalOutstanding)}</p>
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
                  <p className="text-2xl font-bold">{apItems.filter((i:any)=>i.approval_status==='requires_approval').length}</p>
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
                  <p className="text-2xl font-bold">{readyToPayCount}</p>
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
                  <p className="text-2xl font-bold">{overdueCount}</p>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vendor Invoices</CardTitle>
                  <CardDescription>Manage and process vendor invoices</CardDescription>
                </div>
                <ExportUtilities
                  data={apItems}
                  filename="accounts-payable"
                  reportType="Accounts Payable - Vendor Invoices"
                />
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8}>Loading...</TableCell>
                      </TableRow>
                    ) : apItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">No vendor invoices found</TableCell>
                      </TableRow>
                    ) : (
                      apItems.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.vendor_name || '-'}</TableCell>
                          <TableCell>{item.invoice_number || '-'}</TableCell>
                          <TableCell>{formatCurrency(Number(item.original_amount || 0))}</TableCell>
                          <TableCell>{item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{getStatusBadge((item.status === 'open' && (((item.aging_days || 0) > 0) || (item.due_date && new Date(item.due_date) < new Date()))) ? 'overdue' : item.status)}</TableCell>
                          <TableCell>{getStatusBadge(item.approval_status, 'approval')}</TableCell>
                          <TableCell className="text-sm">{item.gl_account_code || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">View</Button>
                              {item.approval_status === 'requires_approval' && (
                                <Button size="sm" onClick={() => handleApproveAp(item)}>Approve</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
                <div className="text-sm text-muted-foreground">Purchase orders module coming soon.</div>
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
                    {apItems
                      .filter((item: any) => item.approval_status === 'requires_approval')
                      .map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.vendor_name || '-'}</h3>
                            <Badge variant="warning">Requires Approval</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Invoice: {item.invoice_number || '-'} | 
                            Amount: ${Number(item.original_amount || 0).toFixed(2)} | 
                            Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            GL Account: {item.gl_account_code || '-'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApproveAp(item)}>
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
    </AppLayout>
  );
};

export default AccountsPayable;