
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Check, X, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import InvoiceToolbar from '@/components/invoices/InvoiceToolbar';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const InvoiceQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markAllAsRead } = useInvoiceNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  
  const {
    invoices,
    isLoading,
    refreshInvoices,
    updateInvoiceStatus,
    deleteInvoice,
    lastRefreshed
  } = useInvoices();

  useEffect(() => {
    markAllAsRead();
  }, []);

  // Check if there are approved invoices that need to be scheduled for payment
  useEffect(() => {
    const approvedInvoices = invoices.filter(
      inv => inv.status === 'approved' && !inv.payment_id
    );
    setShowPaymentAlert(approvedInvoices.length > 0);
  }, [invoices]);

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
    toast({
      title: "Invoice Approved",
      description: "The invoice has been approved and is now ready for payment processing.",
    });
  };

  const handleRejectInvoice = (id: string) => {
    updateInvoiceStatus(id, 'rejected');
    toast({
      title: "Invoice Rejected",
      description: "The invoice has been rejected and will not be processed for payment.",
    });
  };

  const handleViewPaymentsQueue = () => {
    navigate('/accounting/transactions-payments');
    // In a real app, you might set the default tab in the transactions-payments page
  };

  return (
    <PageTemplate 
      title="Invoice Queue" 
      icon={<Receipt className="h-8 w-8" />}
      description="Process and approve incoming vendor invoices for payment."
    >
      <div className="mt-6 space-y-4">
        {showPaymentAlert && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Approved Invoices Ready for Payment</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span className="text-amber-700">
                Some approved invoices are ready to be scheduled for payment.
              </span>
              <Button 
                variant="outline" 
                className="border-amber-500 text-amber-600"
                onClick={handleViewPaymentsQueue}
              >
                View Payment Queue
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <Tabs defaultValue="pending" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="all-invoices">All Invoices</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <InvoiceToolbar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
              />
              <div className="mt-4">
                <InvoiceTable 
                  invoices={filteredInvoices}
                  isLoading={isLoading}
                  onViewInvoice={handleViewInvoice}
                  onApproveInvoice={handleApproveInvoice}
                  onRejectInvoice={handleRejectInvoice}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="approved" className="mt-4">
              <InvoiceToolbar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
              />
              <div className="mt-4">
                <InvoiceTable 
                  invoices={filteredInvoices}
                  isLoading={isLoading}
                  onViewInvoice={handleViewInvoice}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleViewPaymentsQueue}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-2" /> Process Approved Invoices
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-4">
              <InvoiceToolbar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
              />
              <div className="mt-4">
                <InvoiceTable 
                  invoices={filteredInvoices}
                  isLoading={isLoading}
                  onViewInvoice={handleViewInvoice}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="paid" className="mt-4">
              <InvoiceToolbar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
              />
              <div className="mt-4">
                <InvoiceTable 
                  invoices={filteredInvoices}
                  isLoading={isLoading}
                  onViewInvoice={handleViewInvoice}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="all-invoices" className="mt-4">
              <InvoiceToolbar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
              />
              <div className="mt-4">
                <InvoiceTable 
                  invoices={filteredInvoices}
                  isLoading={isLoading}
                  onViewInvoice={handleViewInvoice}
                  onApproveInvoice={handleApproveInvoice}
                  onRejectInvoice={handleRejectInvoice}
                />
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
