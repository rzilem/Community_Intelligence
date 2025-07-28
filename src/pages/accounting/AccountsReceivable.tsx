import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Filter, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for accounts receivable
const mockReceivables = [
  {
    id: '1',
    propertyId: 'PROP-001',
    propertyAddress: '123 Oak Street, Unit 204',
    ownerName: 'John Smith',
    invoiceNumber: 'INV-2025-001',
    amount: 350,
    dueDate: '2025-01-15',
    daysPastDue: 15,
    status: 'overdue',
    type: 'Monthly Assessment'
  },
  {
    id: '2',
    propertyId: 'PROP-002',
    propertyAddress: '456 Pine Avenue, Unit 108',
    ownerName: 'Sarah Johnson',
    invoiceNumber: 'INV-2025-002',
    amount: 425,
    dueDate: '2025-01-30',
    daysPastDue: 0,
    status: 'current',
    type: 'Monthly Assessment'
  },
  {
    id: '3',
    propertyId: 'PROP-003',
    propertyAddress: '789 Maple Drive, Unit 312',
    ownerName: 'Mike Wilson',
    invoiceNumber: 'INV-2025-003',
    amount: 75,
    dueDate: '2025-01-10',
    daysPastDue: 20,
    status: 'overdue',
    type: 'Late Fee'
  },
  {
    id: '4',
    propertyId: 'PROP-004',
    propertyAddress: '321 Elm Street, Unit 506',
    ownerName: 'Lisa Davis',
    invoiceNumber: 'INV-2025-004',
    amount: 1200,
    dueDate: '2025-02-15',
    daysPastDue: 0,
    status: 'current',
    type: 'Special Assessment'
  }
];

const AccountsReceivable = () => {
  const [receivables] = useState(mockReceivables);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReceivables = receivables.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );

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

  // Calculate summary stats
  const totalOutstanding = receivables.reduce((sum, item) => sum + item.amount, 0);
  const overdueAmount = receivables
    .filter(item => item.status === 'overdue')
    .reduce((sum, item) => sum + item.amount, 0);
  const currentAmount = receivables
    .filter(item => item.status === 'current')
    .reduce((sum, item) => sum + item.amount, 0);

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
                  {filteredReceivables.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.propertyId}</div>
                          <div className="text-sm text-muted-foreground">{item.propertyAddress}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.ownerName}</TableCell>
                      <TableCell className="font-mono">{item.invoiceNumber}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell>
                        {item.daysPastDue > 0 ? (
                          <span className="text-red-600 font-medium">{item.daysPastDue} days</span>
                        ) : (
                          <span className="text-green-600">Current</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
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
                  ))}
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