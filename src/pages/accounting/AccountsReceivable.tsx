import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Filter, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import { toCSV } from '@/utils/csv';

const AccountsReceivable = () => {
  const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;

  const { data: receivables = [], isLoading } = useSupabaseQuery<any[]>(
    'accounts_receivable',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
      order: { column: 'due_date', ascending: true },
    },
    !!associationId
  );

  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredReceivables = receivables.filter((item: any) => {
    const displayStatus = item.status === 'open' ? (item.aging_days > 0 ? 'overdue' : 'current') : item.status;
    return statusFilter === 'all' || displayStatus === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalOutstanding = receivables.reduce((sum: number, item: any) => sum + Number(item.original_amount || 0), 0);
  const overdueAmount = receivables
    .filter((item: any) => (item.status === 'open' && item.aging_days > 0))
    .reduce((sum: number, item: any) => sum + Number(item.original_amount || 0), 0);
  const currentAmount = receivables
    .filter((item: any) => (item.status === 'open' && (item.aging_days || 0) === 0))
    .reduce((sum: number, item: any) => sum + Number(item.original_amount || 0), 0);

  return (
    <AppLayout>
      <PageTemplate
        title="Accounts Receivable"
        icon={<Receipt className="h-8 w-8" />}
        description="Track outstanding assessments and payments from property owners."
          actions={
            <div className="flex items-center gap-2">
              <TooltipButton
                tooltip="Download AR report"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  const csv = toCSV(receivables);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'accounts-receivable.csv';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </TooltipButton>
              <TooltipButton
                tooltip="Send payment reminders"
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Reminders
              </TooltipButton>
            </div>
          }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground">{receivables.length} items</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Receivables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentAmount)}</div>
                <p className="text-xs text-muted-foreground">Not past due</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Outstanding Receivables</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Past Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map((item: any) => {
                    const displayStatus = item.status === 'open' ? ((item.aging_days || 0) > 0 ? 'overdue' : 'current') : item.status;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.property_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="font-mono">{item.invoice_number || '-'}</TableCell>
                        <TableCell>{item.invoice_type || '-'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(Number(item.original_amount || 0))}</TableCell>
                        <TableCell>{item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          {(item.aging_days || 0) > 0 ? (
                            <span className="text-red-600 font-medium">{item.aging_days} days</span>
                          ) : (
                            <span className="text-green-600">Current</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(displayStatus)}>
                            {displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TooltipButton
                              tooltip="Send payment reminder"
                              variant="ghost"
                              size="sm"
                            >
                              <Mail className="h-4 w-4" />
                            </TooltipButton>
                            <TooltipButton
                              tooltip="View details"
                              variant="ghost"
                              size="sm"
                            >
                              View
                            </TooltipButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default AccountsReceivable;