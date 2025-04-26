
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Inbox, 
  Plus, 
  Receipt, 
  RefreshCcw, 
  Settings2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { useInvoices } from '@/hooks/invoices/useInvoices';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import { ColumnSettings } from '@/components/ui/column-settings';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const InvoiceQueue = () => {
  const navigate = useNavigate();
  // Change default from 'all' to 'pending'
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
  
  // Update status filter when tab changes or on initial load
  useEffect(() => {
    setStatusFilter(activeTab);
  }, [activeTab, setStatusFilter]);

  const handleAddInvoice = () => {
    navigate("/accounting/invoice-queue/new");
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

  // Count invoices by status
  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
  const approvedCount = invoices.filter(inv => inv.status === 'approved').length;
  const rejectedCount = invoices.filter(inv => inv.status === 'rejected').length;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;

  return (
    <PageTemplate
      title="Invoice Queue"
      icon={<Inbox className="h-8 w-8" />}
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
        <div className="space-x-2">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="inline-flex"
          >
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {isLoading ? <Skeleton className="h-4 w-4" /> : invoices.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                  {isLoading ? <Skeleton className="h-4 w-4" /> : pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  {isLoading ? <Skeleton className="h-4 w-4" /> : approvedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                  {isLoading ? <Skeleton className="h-4 w-4" /> : rejectedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  {isLoading ? <Skeleton className="h-4 w-4" /> : paidCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-4 space-y-2 min-w-[220px]">
              <h4 className="text-sm font-medium mb-2">Display Options</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
                <Switch 
                  id="auto-refresh" 
                  checked={autoRefreshEnabled} 
                  onCheckedChange={toggleAutoRefresh} 
                />
              </div>
              <ColumnSettings
                columns={columns}
                visibleColumnIds={visibleColumnIds}
                onColumnChange={updateVisibleColumns}
                onReset={resetToDefaults}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={refreshInvoices} 
            variant="outline" 
            size="icon" 
            aria-label="Refresh Invoices"
            title="Refresh Invoices"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Inbox className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatDateTime(lastRefreshed)}</span>
            {autoRefreshEnabled && (
              <Badge variant="outline" className="bg-green-50 border-green-200">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Auto-refresh on
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
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
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
        
        {invoices.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 bg-muted/40 rounded-md">
            <Receipt className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== 'all' 
                ? `There are no ${statusFilter} invoices to display.`
                : 'Start by creating a new invoice or wait for emails to be processed.'}
            </p>
            <Button onClick={handleAddInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice Manually
            </Button>
          </div>
        )}
        
        {invoices.length === 0 && invoices.length > 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 bg-muted/40 rounded-md">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            <h3 className="text-lg font-medium">No matches found</h3>
            <p className="text-muted-foreground">
              No invoices match your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
