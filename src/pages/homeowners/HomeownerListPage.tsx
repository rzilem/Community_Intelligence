
import React, { useState, useEffect } from 'react';
import { Users, Download, Plus, Search, Filter, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HomeownerTable from './components/HomeownerTable';
import VirtualizedHomeownerTable from './components/VirtualizedHomeownerTable';
import HomeownerGrid from './HomeownerGrid';
import HomeownerFilters from './components/HomeownerListFilters';
import HomeownerPagination from './components/HomeownerPagination';
import { useHomeownersData } from './hooks/useHomeownersData';
import { useHomeownerFilters } from './hooks/useHomeownerFilters';
import { useHomeownerColumns } from './hooks/useHomeownerColumns';
import { performanceMonitor } from './hooks/services/performance-monitor-service';
import { toast } from 'sonner';

const HomeownerListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'virtual'>('virtual'); // Default to virtual for better performance
  
  const { 
    residents: homeowners, 
    loading, 
    error, 
    associations, 
    totalCount,
    refreshData,
    isDataCached,
    lastFetchTime
  } = useHomeownersData();
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filterAssociation: associationFilter, 
    setFilterAssociation: setAssociationFilter,
    filterStatus: statusFilter, 
    setFilterStatus: setStatusFilter,
    filterType,
    setFilterType,
    showBalanceOnly,
    setShowBalanceOnly,
    showViolationsOnly,
    setShowViolationsOnly,
    filteredHomeowners,
    clearAllFilters,
    isFiltered,
    filteredCount
  } = useHomeownerFilters(homeowners);
  
  const { visibleColumnIds, updateVisibleColumns, resetToDefaults } = useHomeownerColumns();
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, associationFilter, filterType, showBalanceOnly, showViolationsOnly]);
  
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const data = filteredHomeowners.map(homeowner => ({
        name: homeowner.name,
        email: homeowner.email,
        propertyAddress: homeowner.propertyAddress,
        status: homeowner.status,
        association: homeowner.associationName,
        balance: homeowner.balance || 0,
        type: homeowner.type
      }));
      
      if (format === 'csv') {
        const csv = [
          Object.keys(data[0] || {}).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homeowners-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
      
      toast.success(`${filteredHomeowners.length} homeowners exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export homeowners`);
    }
  };

  const handleRefresh = () => {
    refreshData();
    toast.success('Data refreshed');
  };

  const handlePerformanceReport = () => {
    performanceMonitor.logPerformanceReport();
    toast.success('Performance report logged to console');
  };

  const paginatedHomeowners = filteredHomeowners.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Create column management functions that match expected interface
  const toggleColumn = (columnId: string) => {
    const currentColumns = visibleColumnIds;
    const newColumns = currentColumns.includes(columnId)
      ? currentColumns.filter(id => id !== columnId)
      : [...currentColumns, columnId];
    updateVisibleColumns(newColumns);
  };

  const resetColumns = () => {
    resetToDefaults();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Homeowners</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{totalCount} Total</Badge>
              {isFiltered && <Badge variant="secondary">{filteredCount} Filtered</Badge>}
              {isDataCached && <Badge variant="outline">Cached</Badge>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePerformanceReport}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Homeowner
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error: {error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Homeowner Management</CardTitle>
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${totalCount} homeowners...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <HomeownerFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              associationFilter={associationFilter}
              setAssociationFilter={setAssociationFilter}
              associations={associations}
            />
          </div>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'grid' | 'virtual')}>
            <TabsList>
              <TabsTrigger value="virtual">Virtual Table</TabsTrigger>
              <TabsTrigger value="table">Standard Table</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="virtual" className="space-y-4">
              <VirtualizedHomeownerTable
                homeowners={filteredHomeowners}
                loading={loading}
                visibleColumns={visibleColumnIds}
                onToggleColumn={toggleColumn}
                onResetColumns={resetColumns}
              />
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <HomeownerTable
                homeowners={paginatedHomeowners}
                loading={loading}
                visibleColumns={visibleColumnIds}
                onToggleColumn={toggleColumn}
                onResetColumns={resetColumns}
              />
              <HomeownerPagination
                currentPage={currentPage}
                totalItems={filteredHomeowners.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </TabsContent>
            
            <TabsContent value="grid" className="space-y-4">
              <HomeownerGrid homeowners={paginatedHomeowners} />
              <HomeownerPagination
                currentPage={currentPage}
                totalItems={filteredHomeowners.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeownerListPage;
