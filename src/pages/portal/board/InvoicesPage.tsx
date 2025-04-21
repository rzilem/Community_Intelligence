
import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { CreditCard, Search, Filter, Download, Eye, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Sample invoices data
const invoices = [
  { id: 1, vendor: 'Landscape Masters', description: 'Monthly Landscaping', amount: 2500, date: '2023-10-01', dueDate: '2023-10-15', status: 'Pending' },
  { id: 2, vendor: 'Pool Experts', description: 'Pool Maintenance', amount: 750, date: '2023-09-28', dueDate: '2023-10-12', status: 'Approved' },
  { id: 3, vendor: 'Security Systems', description: 'Gate Repairs', amount: 1200, date: '2023-09-20', dueDate: '2023-10-05', status: 'Paid' },
  { id: 4, vendor: 'Clean Team', description: 'Clubhouse Cleaning', amount: 350, date: '2023-09-15', dueDate: '2023-09-30', status: 'Paid' },
  { id: 5, vendor: 'Electric Co.', description: 'Common Area Lighting', amount: 425, date: '2023-09-10', dueDate: '2023-09-25', status: 'Paid' },
  { id: 6, vendor: 'Legal Services', description: 'Document Review', amount: 1500, date: '2023-10-05', dueDate: '2023-10-20', status: 'Pending' },
  { id: 7, vendor: 'Tree Trimmers', description: 'Tree Removal', amount: 1800, date: '2023-09-25', dueDate: '2023-10-10', status: 'Approved' },
];

const InvoicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Filter function based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
      case 'Paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleViewInvoice = (invoice: any) => {
    setViewingInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  return (
    <PortalPageLayout 
      title="Invoices" 
      icon={<CreditCard className="h-6 w-6" />}
      description="View and manage vendor invoices"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No invoices found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.vendor}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {invoice.status === 'Pending' && (
                              <>
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
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
        </div>
      </div>

      {/* Invoice View Dialog */}
      {viewingInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Invoice #{viewingInvoice.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b">
                <div>
                  <h3 className="font-semibold text-lg">{viewingInvoice.vendor}</h3>
                  <p className="text-sm text-muted-foreground">Vendor ID: V-{viewingInvoice.id + 1000}</p>
                </div>
                <div>
                  <p className="text-right font-bold text-lg">${viewingInvoice.amount.toFixed(2)}</p>
                  <p className="text-right text-sm">{getStatusBadge(viewingInvoice.status)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{viewingInvoice.description}</p>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <p className="text-center text-sm text-muted-foreground mb-2">Invoice Preview</p>
                <div className="border rounded bg-white p-6 flex items-center justify-center min-h-[200px]">
                  <FileText className="h-16 w-16 text-gray-300" />
                </div>
                <div className="mt-2 flex justify-center">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
              
              {viewingInvoice.status === 'Pending' && (
                <div className="flex justify-between pt-2">
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PortalPageLayout>
  );
};

export default InvoicesPage;
