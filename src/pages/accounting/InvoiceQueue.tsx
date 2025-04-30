
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useToast } from '@/hooks/use-toast';
import InvoicePaymentAlert from '@/components/invoices/InvoicePaymentAlert';
import InvoiceTabContent from '@/components/invoices/InvoiceTabContent';
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

  useEffect(() => {
    const approvedInvoices = invoices.filter(
      inv => inv.status === 'approved' && !('payment_id' in inv)
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
  };

  return (
    <PageTemplate
      title="Invoice Queue"
      icon={<Receipt className="h-8 w-8" />}
      description="Process and approve incoming vendor invoices for payment."
    >
      <div className="mt-6 space-y-4">
        <InvoicePaymentAlert 
          show={showPaymentAlert} 
          onViewPaymentsQueue={handleViewPaymentsQueue} 
        />
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
              <InvoiceTabContent
                tabKey="pending"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
                invoices={filteredInvoices}
                isLoading={isLoading}
                onViewInvoice={handleViewInvoice}
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
              />
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              <InvoiceTabContent
                tabKey="approved"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
                invoices={filteredInvoices}
                isLoading={isLoading}
                onViewInvoice={handleViewInvoice}
              />
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
              <InvoiceTabContent
                tabKey="rejected"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
                invoices={filteredInvoices}
                isLoading={isLoading}
                onViewInvoice={handleViewInvoice}
              />
            </TabsContent>
            <TabsContent value="paid" className="mt-4">
              <InvoiceTabContent
                tabKey="paid"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
                invoices={filteredInvoices}
                isLoading={isLoading}
                onViewInvoice={handleViewInvoice}
              />
            </TabsContent>
            <TabsContent value="all-invoices" className="mt-4">
              <InvoiceTabContent
                tabKey="all-invoices"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddInvoice={handleAddInvoice}
                onRefresh={refreshInvoices}
                onFilterChange={setActiveTab}
                invoices={filteredInvoices}
                isLoading={isLoading}
                onViewInvoice={handleViewInvoice}
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
              />
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
