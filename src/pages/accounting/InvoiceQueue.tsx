
import React, { useState, useEffect } from 'react';
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
import { useInvoices } from '@/hooks/invoices/useInvoices';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadge = (status: string) => {
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
  const { markAllAsRead } = useInvoiceNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all-invoices');
  
  const {
    invoices,
    isLoading,
    refreshInvoices,
    updateInvoiceStatus,
    deleteInvoice,
    lastRefreshed
  } = useInvoices();

  // Mark notifications as read when visiting this page
  useEffect(() => {
    markAllAsRead();
  }, []);

  // Filter invoices based on search term and active tab
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      Object.values(invoice).some(value => 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    const matchesStatus = 
      activeTab === 'all-invoices' || 
      activeTab === invoice.status;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddInvoice = () => {
    navigate('/accounting/invoice-queue/new');
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/accounting/invoice-queue/${id}`);
  };

  const handleApproveInvoice = (id: string) => {
    updateInvoiceStatus(id, 'approved');
  };

  const handleRejectInvoice = (id: string) => {
    updateInvoiceStatus(id, 'rejected');
  };

  return (
    <PageTemplate 
      title="Invoice Queue" 
      icon={<Receipt className="h-8 w-8" />}
      description="Process and approve incoming vendor invoices for payment."
    >
      <div className="mt-6 space-y-4">
        <Card className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
                  <TooltipButton variant="outline" tooltip="Refresh invoice list" onClick={refreshInvoices}>
                    <History className="h-4 w-4 mr-1" /> Refresh
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
                    <DropdownMenuItem onClick={() => setActiveTab('all-invoices')}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('pending')}>
                      Pending Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('approved')}>
                      Approved Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('rejected')}>
                      Rejected Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('paid')}>
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
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium" onClick={() => handleViewInvoice(invoice.id)}>
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.vendor}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.association_name || 'N/A'}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.invoice_date}</TableCell>
                          <TableCell className="text-right" onClick={() => handleViewInvoice(invoice.id)}>
                            ${Number(invoice.amount).toFixed(2)}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice.id)}>{invoice.due_date}</TableCell>
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
            
            {/* These tabs will automatically filter by status */}
            <TabsContent value="pending" className="mt-4">
              <div className="mt-4 rounded-md border">
                <Table>
                  {/* Same table structure as above */}
                  {/* Content filtered to show only pending invoices */}
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              <div className="mt-4 rounded-md border">
                <Table>
                  {/* Same table structure as above */}
                  {/* Content filtered to show only approved invoices */}
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <div className="mt-4 rounded-md border">
                <Table>
                  {/* Same table structure as above */}
                  {/* Content filtered to show only rejected invoices */}
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <div className="mt-4 rounded-md border">
                <Table>
                  {/* Same table structure as above */}
                  {/* Content filtered to show only paid invoices */}
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>Showing {filteredInvoices.length} of {invoices.length} invoices</div>
          <div>Last updated: {lastRefreshed.toLocaleString()}</div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
