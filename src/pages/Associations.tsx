
import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Network, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssociations } from '@/hooks/associations';
import AssociationTable from '@/components/associations/AssociationTable';
import PaginatedAssociationTable from '@/components/associations/PaginatedAssociationTable';
import { Association } from '@/types/association-types';
import ApiError from '@/components/ui/api-error';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usePagination, setUsePagination] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  const { 
    associations, 
    isLoading, 
    error,
    manuallyRefresh,
    updateAssociation,
    deleteAssociation 
  } = useAssociations();

  // Ensure associations is treated as array and protect from undefined
  const associationsArray = Array.isArray(associations) ? associations : [];

  const filteredAssociations = associationsArray.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeAssociations = filteredAssociations.filter(a => a.is_archived === false);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived === true);

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

  // Handle toggling paginated view with proper tab reset
  const togglePaginatedView = useCallback(() => {
    setUsePagination(prev => !prev);
    // Reset to the first tab when switching view modes
    setCurrentTab('all');
    
    // If we're switching back from paginated view, refresh the data
    if (usePagination) {
      manuallyRefresh();
    }
  }, [usePagination, manuallyRefresh]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  // Handle refreshing data
  const handleRefresh = () => {
    toast.info("Refreshing associations...");
    manuallyRefresh();
  };

  // If no associations and not loading, refresh automatically once
  useEffect(() => {
    if (!isLoading && associationsArray.length === 0 && !error) {
      console.log("No associations found, refreshing automatically...");
      manuallyRefresh();
    }
  }, [isLoading, associationsArray.length, error, manuallyRefresh]);

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
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={togglePaginatedView}
                      >
                        {usePagination ? "Standard View" : "Paginated View"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle between standard and paginated views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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
              usePagination ? (
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <PaginatedAssociationTable 
                      associationStatus="all" 
                      onEdit={handleEditAssociation}
                      onDelete={handleDeleteAssociation}
                    />
                  </TabsContent>

                  <TabsContent value="active">
                    <PaginatedAssociationTable 
                      associationStatus="active" 
                      onEdit={handleEditAssociation}
                      onDelete={handleDeleteAssociation}
                    />
                  </TabsContent>

                  <TabsContent value="inactive">
                    <PaginatedAssociationTable 
                      associationStatus="inactive" 
                      onEdit={handleEditAssociation}
                      onDelete={handleDeleteAssociation}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">
                      All
                      <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                        {filteredAssociations.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Active
                      <span className="ml-1.5 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
                        {activeAssociations.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                      Inactive
                      <span className="ml-1.5 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                        {inactiveAssociations.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <AssociationTable associations={filteredAssociations} isLoading={isLoading} onEdit={handleEditAssociation} onDelete={handleDeleteAssociation} />
                  </TabsContent>

                  <TabsContent value="active">
                    <AssociationTable associations={activeAssociations} isLoading={isLoading} onEdit={handleEditAssociation} onDelete={handleDeleteAssociation} />
                  </TabsContent>

                  <TabsContent value="inactive">
                    <AssociationTable associations={inactiveAssociations} isLoading={isLoading} onEdit={handleEditAssociation} onDelete={handleDeleteAssociation} />
                  </TabsContent>
                </Tabs>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Associations;
