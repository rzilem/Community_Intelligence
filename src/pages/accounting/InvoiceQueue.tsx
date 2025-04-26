
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useToast } from '@/hooks/use-toast';
import InvoicePaymentAlert from '@/components/invoices/InvoicePaymentAlert';
import InvoiceTabContent from '@/components/invoices/InvoiceTabContent';
import BulkActionBar from '@/components/invoices/BulkActionBar';
import InvoiceAnalytics from '@/components/invoices/InvoiceAnalytics';
import ColumnSelector from '@/components/table/ColumnSelector';
import { useInvoiceColumns } from '@/hooks/invoices/useInvoiceColumns';

const InvoiceQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markAllAsRead } = useInvoiceNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{count: number, lastUpdate: string}>({
    count: 0,
    lastUpdate: new Date().toISOString()
  });

  const {
    invoices,
    isLoading,
    refreshInvoices,
    updateInvoiceStatus,
    deleteInvoice,
    lastRefreshed
  } = useInvoices();

  const {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults
  } = useInvoiceColumns();

  useEffect(() => {
    markAllAsRead();
  }, []);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (isAutoRefreshing) {
      const timer = setInterval(() => {
        console.log("Auto-refreshing invoices...");
        refreshInvoices();
        setRefreshCount(prev => prev + 1);
      }, 30000);
      
      return () => clearInterval(timer);
    }
  }, [isAutoRefreshing, refreshInvoices]);

  // Update debug info when invoices change
  useEffect(() => {
    setDebugInfo({
      count: invoices.length,
      lastUpdate: new Date().toISOString()
    });
  }, [invoices]);

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

  const handleBulkApprove = async () => {
    for (const id of selectedInvoiceIds) {
      await updateInvoiceStatus(id, 'approved');
    }
    setSelectedInvoiceIds([]);
    toast({
      title: "Bulk Approval Complete",
      description: `Successfully approved ${selectedInvoiceIds.length} invoices.`,
    });
  };

  const handleBulkReject = async () => {
    for (const id of selectedInvoiceIds) {
      await updateInvoiceStatus(id, 'rejected');
    }
    setSelectedInvoiceIds([]);
    toast({
      title: "Bulk Rejection Complete",
      description: `Successfully rejected ${selectedInvoiceIds.length} invoices.`,
    });
  };

  const handleBulkExport = () => {
    const selectedInvoices = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));
    toast({
      title: "Export Started",
      description: `Exporting ${selectedInvoices.length} invoices.`,
    });
  };

  const toggleAutoRefresh = () => {
    setIsAutoRefreshing(prev => !prev);
    toast({
      title: isAutoRefreshing ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: isAutoRefreshing ? 
        "Automatic invoice refresh has been disabled." : 
        "Invoices will automatically refresh every 30 seconds.",
    });
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
        
        {showAnalytics && (
          <InvoiceAnalytics invoices={invoices} />
        )}

        <div className="flex justify-between items-center">
          <BulkActionBar
            selectedInvoices={selectedInvoiceIds}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onBulkExport={handleBulkExport}
            onClearSelection={() => setSelectedInvoiceIds([])}
          />

          <div className="flex space-x-2">
            <Button 
              onClick={refreshInvoices} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            
            <Button 
              onClick={toggleAutoRefresh} 
              variant={isAutoRefreshing ? "default" : "outline"} 
              size="sm"
            >
              {isAutoRefreshing ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="all-invoices">All Invoices</TabsTrigger>
              </TabsList>
            </Tabs>
            <ColumnSelector
              columns={columns}
              selectedColumns={visibleColumnIds}
              onChange={updateVisibleColumns}
              onReorder={reorderColumns}
              resetToDefaults={resetToDefaults}
              className="ml-auto"
            />
          </div>

          <Tabs defaultValue="pending" onValueChange={setActiveTab} value={activeTab}>
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
                columns={columns}
                visibleColumnIds={visibleColumnIds}
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
                columns={columns}
                visibleColumnIds={visibleColumnIds}
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
                columns={columns}
                visibleColumnIds={visibleColumnIds}
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
                columns={columns}
                visibleColumnIds={visibleColumnIds}
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
                columns={columns}
                visibleColumnIds={visibleColumnIds}
              />
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>Showing {filteredInvoices.length} of {invoices.length} invoices</div>
          <div>Last updated: {lastRefreshed.toLocaleString()}</div>
        </div>

        {/* Debug Panel */}
        <Card className="p-3 bg-gray-50">
          <div className="text-xs text-gray-500">
            <h3 className="font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Debug Information
            </h3>
            <div className="mt-1">
              <p>Total Invoices in DB: {debugInfo.count}</p>
              <p>Last API Update: {debugInfo.lastUpdate}</p>
              <p>Auto-refresh: {isAutoRefreshing ? "Enabled" : "Disabled"}</p>
              <p>Refresh Count: {refreshCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
