
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Network, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAssociations } from '@/hooks/associations';
import { Association } from '@/types/association-types';
import ApiError from '@/components/ui/api-error';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AssociationTable, { associationTableColumns } from '@/components/associations/AssociationTable';
import { useUserColumns } from '@/hooks/useUserColumns';
import ColumnSelector from '@/components/table/ColumnSelector';

const PAGE_SIZE = 10;

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);

  const {
    associations,
    isLoading,
    error,
    manuallyRefresh,
    updateAssociation,
    deleteAssociation
  } = useAssociations();

  const associationsArray = Array.isArray(associations) ? associations : [];

  // Filter by search & archived/active status
  const filteredAssociations = associationsArray.filter((association) => {
    const matchesSearch =
      association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const showAssociation =
      includeInactive ? true : !association.is_archived;
    return matchesSearch && showAssociation;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssociations.length / PAGE_SIZE));
  const paginatedAssociations = filteredAssociations.slice(
    (currentPage - 1) * PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE + PAGE_SIZE
  );

  // Reset to page 1 on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, includeInactive]);

  // Restore column selector functionality
  const {
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
    loading: columnsLoading,
  } = useUserColumns(associationTableColumns, 'associations-table');

  const handleEditAssociation = (id: string, data: Partial<Association>) => {
    updateAssociation(id, data)
      .then(() => {
        toast.success("Association updated successfully");
      })
      .catch((err) => {
        toast.error(`Failed to update association: ${err.message}`);
      });
  };

  const handleDeleteAssociation = (id: string) => {
    deleteAssociation(id)
      .then(() => {
        toast.success("Association archived successfully");
      })
      .catch((err) => {
        toast.error(`Failed to archive association: ${err.message}`);
      });
  };

  const handleRefresh = () => {
    toast.info("Refreshing associations...");
    manuallyRefresh();
  };

  // Pagination controls
  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          title="Next page"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Associations</h1>
          </div>
        </div>

        <p className="text-muted-foreground">Manage community associations and client organizations.</p>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search associations..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={checked => setIncludeInactive(Boolean(checked))}
                    className="mr-2"
                  />
                  <label htmlFor="include-inactive" className="text-sm select-none cursor-pointer">
                    Include inactive
                  </label>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title="Refresh association list"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh association list</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <ColumnSelector
                columns={associationTableColumns}
                selectedColumns={visibleColumnIds}
                onChange={updateVisibleColumns}
                onReorder={reorderColumns}
                resetToDefaults={resetToDefaults}
                className="mb-2"
                storageKey="associations-table"
              />
            </div>

            {error && (
              <ApiError error={error} onRetry={manuallyRefresh} title="Failed to load associations" className="mb-4" />
            )}

            <AssociationTable
              associations={paginatedAssociations}
              isLoading={isLoading || columnsLoading}
              onEdit={handleEditAssociation}
              onDelete={handleDeleteAssociation}
              selectedAssociations={[]}
              // Don't include selection logic here unless needed.
            />

            <Pagination />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Associations;

