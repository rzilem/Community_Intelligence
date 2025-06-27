
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import InvoiceToolbar from '@/components/invoices/InvoiceToolbar';
import BulkAIProcessor from '@/components/common/BulkAIProcessor';

const InvoiceQueue = () => {
  const navigate = useNavigate();
  const { markAllAsRead } = useInvoiceNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
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
        {/* AI Bulk Processing */}
        <BulkAIProcessor
          items={invoices}
          itemType="invoices"
          onProcessingComplete={refreshInvoices}
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
                  onRefreshInvoices={refreshInvoices}
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
                  onRefreshInvoices={refreshInvoices}
                />
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
                  onRefreshInvoices={refreshInvoices}
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
                  onRefreshInvoices={refreshInvoices}
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
                  onRefreshInvoices={refreshInvoices}
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
