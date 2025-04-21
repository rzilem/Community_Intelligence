
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Network, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAssociations } from '@/hooks/associations';
import AssociationTable from '@/components/associations/AssociationTable';
import { Association } from '@/types/association-types';
import ApiError from '@/components/ui/api-error';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

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

  // Filter by search & by includeInactive/active
  const filteredAssociations = associationsArray.filter(association => {
    const matchesSearch =
      association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const includeArchived = includeInactive ? true : !association.is_archived;
    return matchesSearch && includeArchived;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssociations.length / PAGE_SIZE));
  const paginatedAssociations = filteredAssociations.slice(
    (currentPage - 1) * PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE + PAGE_SIZE
  );

  // When filters or search change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, includeInactive]);

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

            {error && (
              <ApiError error={error} onRetry={manuallyRefresh} title="Failed to load associations" className="mb-4" />
            )}

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading associations...</span>
              </div>
            )}

            {!isLoading && associationsArray.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/30 rounded-md">
                <Network className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">No associations found</p>
                <Button onClick={handleRefresh}>Refresh Data</Button>
              </div>
            )}

            {!isLoading && associationsArray.length > 0 && (
              <>
                <AssociationTable
                  associations={paginatedAssociations}
                  isLoading={isLoading}
                  onEdit={handleEditAssociation}
                  onDelete={handleDeleteAssociation}
                />
                {filteredAssociations.length > PAGE_SIZE && (
                  <div className="flex justify-center mt-4 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >Previous</Button>
                    <span className="px-2 text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >Next</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Associations;

// End of file -- This file is getting long. Consider refactoring into smaller components for maintainability.
