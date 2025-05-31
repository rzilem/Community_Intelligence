
import React, { useState, useEffect } from 'react';
import { Users, Download, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeownerTable from './components/HomeownerTable';
import HomeownerGrid from './HomeownerGrid';
import HomeownerFilters from './components/HomeownerListFilters';
import HomeownerPagination from './components/HomeownerPagination';
import { useHomeownersData } from './hooks/useHomeownersData';
import { useHomeownerFilters } from './hooks/useHomeownerFilters';
import { useHomeownerColumns } from './hooks/useHomeownerColumns';
import { toast } from 'sonner';

const HomeownerListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const { 
    residents: homeowners, 
    loading, 
    error, 
    associations, 
    fetchResidentsByAssociationId: refreshData
  } = useHomeownersData();
  
  const { 
    searchTerm, 
    setSearchTerm, 
    filterAssociation: associationFilter, 
    setFilterAssociation: setAssociationFilter,
    filterStatus: statusFilter, 
    setFilterStatus: setStatusFilter,
    filteredHomeowners 
  } = useHomeownerFilters(homeowners);
  
  const { visibleColumnIds, updateVisibleColumns, resetToDefaults } = useHomeownerColumns();
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, associationFilter]);
  
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const data = filteredHomeowners.map(homeowner => ({
        name: homeowner.name,
        email: homeowner.email,
        propertyAddress: homeowner.propertyAddress,
        status: homeowner.status,
        association: homeowner.associationName
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
        a.download = 'homeowners.csv';
        a.click();
      }
      
      toast.success(`Homeowners exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export homeowners`);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Homeowners</h1>
        </div>
        
        <div className="flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Homeowner Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search homeowners..."
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

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'grid')}>
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-4">
              <HomeownerTable
                homeowners={paginatedHomeowners}
                loading={loading}
                visibleColumns={visibleColumnIds}
                onToggleColumn={toggleColumn}
                onResetColumns={resetColumns}
              />
            </TabsContent>
            
            <TabsContent value="grid" className="space-y-4">
              <HomeownerGrid homeowners={paginatedHomeowners} />
            </TabsContent>
          </Tabs>

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
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeownerListPage;
