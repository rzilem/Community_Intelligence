
import React, { useState, useEffect } from 'react';
import { MessageSquare, Filter, Download, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeownerRequestsTable } from '@/components/homeowners/HomeownerRequestsTable';
import { HomeownerRequestFilters } from '@/components/homeowners/HomeownerRequestFilters';
import { HomeownerRequestPagination } from '@/components/homeowners/HomeownerRequestPagination';
import { NewRequestDialog } from '@/components/homeowners/dialog/NewRequestDialog';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { toast } from 'sonner';

const HomeownerRequestsQueue = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  
  const {
    requests,
    loading,
    error,
    filters,
    setFilters,
    refreshRequests,
    exportRequests,
    filteredRequests
  } = useHomeownerRequests();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportRequests(format, filteredRequests);
      toast.success(`Requests exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export requests');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshRequests();
      toast.success('Requests refreshed');
    } catch (error) {
      toast.error('Failed to refresh requests');
    }
  };

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Homeowner Requests</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => setIsNewRequestDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Queue Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HomeownerRequestFilters
            filters={filters}
            onFiltersChange={setFilters}
          />

          <HomeownerRequestsTable
            requests={paginatedRequests}
            loading={loading}
            error={error}
          />

          <HomeownerRequestPagination
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <NewRequestDialog
        open={isNewRequestDialogOpen}
        onOpenChange={setIsNewRequestDialogOpen}
        onSuccess={() => {
          refreshRequests();
          toast.success('Request created successfully');
        }}
      />
    </div>
  );
};

export default HomeownerRequestsQueue;
