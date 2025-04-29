
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Inbox, Plus, Clock } from 'lucide-react';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date-utils';
import { InvoiceQueueFilters } from '@/components/invoices/InvoiceQueueFilters';
import { InvoiceQueueSettings } from '@/components/invoices/InvoiceQueueSettings';
import { InvoiceQueueEmptyState } from '@/components/invoices/InvoiceQueueEmptyState';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent 
} from '@/components/ui/dropdown-menu';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';

const InvoiceQueue = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  
  const { 
    invoices, 
    isLoading,
    columns, 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults,
    refreshInvoices, 
    updateInvoiceStatus, 
    deleteInvoice,
    lastRefreshed,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefreshEnabled,
    toggleAutoRefresh
  } = useInvoices();

  // Add the invoice notifications hook to show the badge
  const { unreadInvoicesCount, markAllAsRead } = useInvoiceNotifications();
  
  useEffect(() => {
    setStatusFilter(activeTab);
  }, [activeTab, setStatusFilter]);

  // Mark notifications as read when viewing the invoice queue
  useEffect(() => {
    if (!isLoading && activeTab === 'pending') {
      markAllAsRead();
    }
  }, [isLoading, activeTab, markAllAsRead]);

  const handleAddInvoice = () => {
    navigate("/accounting/invoice-queue/new");
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/accounting/invoice-queue/${id}`);
  };

  // Count invoices by status
  const counts = {
    total: invoices.length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    approved: invoices.filter(inv => inv.status === 'approved').length,
    rejected: invoices.filter(inv => inv.status === 'rejected').length,
    paid: invoices.filter(inv => inv.status === 'paid').length
  };

  return (
    <PageTemplate
      title="Invoice Queue"
      icon={
        <div className="relative">
          <Inbox className="h-8 w-8" />
          {unreadInvoicesCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadInvoicesCount > 99 ? '99+' : unreadInvoicesCount}
            </Badge>
          )}
        </div>
      }
      description="Review, code, and process invoices for payment"
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={handleAddInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      }
    >
      <div className="flex justify-between items-center mb-4">
        <InvoiceQueueFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          counts={counts}
          isLoading={isLoading}
        />
        
        <InvoiceQueueSettings
          columns={columns}
          visibleColumnIds={visibleColumnIds}
          updateVisibleColumns={updateVisibleColumns}
          resetToDefaults={resetToDefaults}
          refreshInvoices={refreshInvoices}
          autoRefreshEnabled={autoRefreshEnabled}
          toggleAutoRefresh={toggleAutoRefresh}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatDateTime(lastRefreshed)}</span>
          {autoRefreshEnabled && (
            <Badge variant="outline" className="bg-green-50 border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              Auto-refresh on
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin text-primary border-2 border-current border-t-transparent rounded-full" />
                    <p>Loading invoices...</p>
                  </div>
                </div>
              </div>
            ) : (
              <InvoiceTable
                invoices={invoices}
                columns={columns}
                visibleColumnIds={visibleColumnIds}
                onViewInvoice={handleViewInvoice}
                onApproveInvoice={(id) => updateInvoiceStatus(id, 'approved')}
                onRejectInvoice={(id) => updateInvoiceStatus(id, 'rejected')}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
        
        {!isLoading && invoices.length === 0 && (
          <InvoiceQueueEmptyState
            onAddInvoice={handleAddInvoice}
            invoicesExist={!!counts.total}
            statusFilter={statusFilter}
          />
        )}
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
