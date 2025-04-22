
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, FileText, BarChart } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { DataTable } from '@/components/ui/data-table';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Invoice } from '@/types/invoice-types';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InvoiceReportPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  // Fetch invoice data
  const { data: invoices = [], isLoading } = useSupabaseQuery<Invoice[]>({
    tableName: 'invoices',
    select: '*',
    filter: [
      ...(selectedAssociationId ? [{ column: 'association_id', value: selectedAssociationId }] : []),
      ...(selectedStatus ? [{ column: 'status', value: selectedStatus }] : [])
    ],
    orderBy: { column: 'invoice_date', ascending: false }
  },
  !!selectedAssociationId
  );

  // Construct columns for the data table
  const columns = [
    { 
      accessorKey: 'invoice_number', 
      header: 'Invoice #' 
    },
    { 
      accessorKey: 'vendor', 
      header: 'Vendor' 
    },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: (info: any) => `$${parseFloat(info.row.original.amount || 0).toFixed(2)}`
    },
    { 
      accessorKey: 'invoice_date', 
      header: 'Invoice Date',
      cell: (info: any) => info.row.original.invoice_date ? format(new Date(info.row.original.invoice_date), 'MMM dd, yyyy') : '—'
    },
    { 
      accessorKey: 'due_date', 
      header: 'Due Date',
      cell: (info: any) => info.row.original.due_date ? format(new Date(info.row.original.due_date), 'MMM dd, yyyy') : '—'
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.row.original.status === 'paid' ? 'bg-green-100 text-green-800' : 
          info.row.original.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          info.row.original.status === 'approved' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'}`
        }>
          {info.row.original.status}
        </div>
      )
    }
  ];

  // Calculate statistics
  const totalAmount = invoices.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'approved')
    .reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid')
    .reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  
  const invoicesByVendor = invoices.reduce((acc, invoice) => {
    if (!acc[invoice.vendor]) {
      acc[invoice.vendor] = {
        count: 0,
        amount: 0
      };
    }
    acc[invoice.vendor].count += 1;
    acc[invoice.vendor].amount += parseFloat(invoice.amount.toString());
    return acc;
  }, {} as Record<string, { count: number, amount: number }>);

  const topVendors = Object.entries(invoicesByVendor)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Invoice Reports" 
      icon={<BarChart className="h-8 w-8" />}
      description="View and analyze invoice data for your associations"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Invoice Report</CardTitle>
              <AssociationSelector 
                className="w-full md:w-[250px]" 
                onAssociationChange={handleAssociationChange}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:w-auto">
                <DatePickerWithRange 
                  value={dateRange} 
                  onChange={setDateRange} 
                />
              </div>
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Search vendor or invoice #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[250px]"
                />
              </div>
              <div className="w-full md:w-auto">
                <Select value={selectedStatus || ''} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoices Amount</p>
                  <h3 className="text-2xl font-bold">${totalAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {invoices.length} total invoices
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid</p>
                  <h3 className="text-2xl font-bold">${paidAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {invoices.filter(i => i.status === 'paid').length} paid invoices
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold">${pendingAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {invoices.filter(i => i.status === 'pending' || i.status === 'approved').length} pending invoices
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-left p-2">Invoice Count</th>
                    <th className="text-left p-2">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendors.map(([vendor, data], index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{vendor}</td>
                      <td className="p-2">{data.count}</td>
                      <td className="p-2">${data.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {topVendors.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        No vendor data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Details</CardTitle>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns}
              data={invoices.filter(invoice => 
                searchTerm ? 
                  invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) : 
                  true
              )}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default InvoiceReportPage;
