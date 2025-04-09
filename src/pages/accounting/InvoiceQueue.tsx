
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Plus, FileDown, FileUp, History, Filter, Search, Eye, CheckSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Invoice {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  hoaName: string;
  invoiceNumber: string;
  invoiceDate: string;
}

const mockInvoices: Invoice[] = [
  { 
    id: 'INV-001', 
    vendor: 'Landscaping Services Inc.', 
    amount: 1250.00, 
    dueDate: '2025-04-15', 
    status: 'pending',
    hoaName: 'Oakridge Estates',
    invoiceNumber: 'LS-9876',
    invoiceDate: '2025-04-01'
  },
  { 
    id: 'INV-002', 
    vendor: 'Pool Maintenance Co.', 
    amount: 850.00, 
    dueDate: '2025-04-18', 
    status: 'pending',
    hoaName: 'Lakeside Community',
    invoiceNumber: 'PM-5432',
    invoiceDate: '2025-04-02'
  },
  { 
    id: 'INV-003', 
    vendor: 'Security Systems Ltd.', 
    amount: 2100.00, 
    dueDate: '2025-04-22', 
    status: 'approved',
    hoaName: 'Highland Towers',
    invoiceNumber: 'SS-7890',
    invoiceDate: '2025-04-03'
  },
  { 
    id: 'INV-004', 
    vendor: 'Professional Cleaning', 
    amount: 650.00, 
    dueDate: '2025-04-25', 
    status: 'rejected',
    hoaName: 'Oakridge Estates',
    invoiceNumber: 'PC-3456',
    invoiceDate: '2025-03-28'
  },
  { 
    id: 'INV-005', 
    vendor: 'Electrical Repairs', 
    amount: 1800.00, 
    dueDate: '2025-04-30', 
    status: 'pending',
    hoaName: 'Highland Towers',
    invoiceNumber: 'ER-1234',
    invoiceDate: '2025-04-05'
  },
  { 
    id: 'INV-006', 
    vendor: 'Prime Pool Service', 
    amount: 750.00, 
    dueDate: '2025-05-05', 
    status: 'pending',
    hoaName: 'Oakridge Estates',
    invoiceNumber: 'PS-12345',
    invoiceDate: '2025-04-08'
  },
  { 
    id: 'INV-007', 
    vendor: 'Green Thumb Landscaping', 
    amount: 1100.00, 
    dueDate: '2025-05-10', 
    status: 'approved',
    hoaName: 'Lakeside Community',
    invoiceNumber: 'GTL-567',
    invoiceDate: '2025-04-10'
  },
  { 
    id: 'INV-008', 
    vendor: 'Elevator Maintenance Inc.', 
    amount: 950.00, 
    dueDate: '2025-05-15', 
    status: 'paid',
    hoaName: 'Highland Towers',
    invoiceNumber: 'EMI-890',
    invoiceDate: '2025-04-07'
  },
];

const getStatusBadge = (status: Invoice['status']) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'paid':
      return <Badge className="bg-blue-500">Paid</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

const InvoiceQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState(mockInvoices);

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      Object.values(invoice).some(value => 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddInvoice = () => {
    navigate('/accounting/invoice-queue/new');
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/accounting/invoice-queue/${id}`);
  };

  const handleApproveInvoice = (id: string) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'approved' } : invoice
      )
    );
    
    toast({
      title: "Invoice approved",
      description: `Invoice ${id} has been approved for payment.`,
    });
  };

  const handleRejectInvoice = (id: string) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'rejected' } : invoice
      )
    );
    
    toast({
      title: "Invoice rejected",
      description: `Invoice ${id} has been rejected.`,
    });
  };

  return (
    <PageTemplate 
      title="Invoice Queue" 
      icon={<Receipt className="h-8 w-8" />}
      description="Process and approve incoming vendor invoices for payment."
    >
      <div className="mt-6 space-y-4">
        <Card className="p-6">
          <Tabs defaultValue="all-invoices">
            <TabsList>
              <TabsTrigger value="all-invoices">All Invoices</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <TabsContent value="all-invoices" className="mt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <TooltipButton tooltip="Add a new invoice" onClick={handleAddInvoice}>
                    <Plus className="h-4 w-4 mr-1" /> Add Invoice
                  </TooltipButton>
                  <TooltipButton variant="outline" tooltip="Import invoices from a CSV">
                    <FileUp className="h-4 w-4 mr-1" /> Import
                  </TooltipButton>
                </div>
                <div className="flex gap-2">
                  <TooltipButton variant="outline" tooltip="View invoice approval history">
                    <History className="h-4 w-4 mr-1" /> History
                  </TooltipButton>
                  <TooltipButton variant="outline" tooltip="Export the invoice queue as CSV">
                    <FileDown className="h-4 w-4 mr-1" /> Export
                  </TooltipButton>
                </div>
              </div>
            
              <div className="mt-4 flex justify-between items-center">
                <div className="relative w-80">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      Pending Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                      Approved Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                      Rejected Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
                      Paid Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            
              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>HOA</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium" onClick={() => handleViewInvoice(invoice.id)}>
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.vendor}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.hoaName}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.invoiceDate}</TableCell>
                          <TableCell className="text-right" onClick={() => handleViewInvoice(invoice.id)}>
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.dueDate}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipButton 
                                size="sm" 
                                variant="ghost" 
                                tooltip="View invoice details"
                                onClick={() => handleViewInvoice(invoice.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </TooltipButton>
                              {invoice.status === 'pending' && (
                                <>
                                  <TooltipButton 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-green-500 text-green-500 hover:bg-green-50" 
                                    tooltip="Approve this invoice"
                                    onClick={() => handleApproveInvoice(invoice.id)}
                                  >
                                    <CheckSquare className="h-4 w-4" />
                                  </TooltipButton>
                                  <TooltipButton 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-red-500 text-red-500 hover:bg-red-50" 
                                    tooltip="Reject this invoice"
                                    onClick={() => handleRejectInvoice(invoice.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </TooltipButton>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No invoices found that match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Additional tabs will use the same filter but with preset status */}
            <TabsContent value="pending" className="mt-4">
              {/* Similar content with status filter preset to "pending" */}
              <div className="text-center py-4 text-gray-500">
                This tab will show only pending invoices.
              </div>
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              <div className="text-center py-4 text-gray-500">
                This tab will show only approved invoices.
              </div>
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <div className="text-center py-4 text-gray-500">
                This tab will show only rejected invoices.
              </div>
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <div className="text-center py-4 text-gray-500">
                This tab will show only paid invoices.
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>Showing {filteredInvoices.length} of {mockInvoices.length} invoices</div>
          <div>Last updated: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
