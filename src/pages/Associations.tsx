
import React, { useState } from 'react';
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

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usePagination, setUsePagination] = useState(false);

  const { 
    associations, 
    isLoading, 
    error,
    manuallyRefresh,
    updateAssociation,
    deleteAssociation 
  } = useAssociations();

  // Ensure associations is treated as array
  const associationsArray = Array.isArray(associations) ? associations : [];

  const filteredAssociations = associationsArray.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeAssociations = filteredAssociations.filter(a => a.is_archived === false);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived === true);

  const handleEditAssociation = (id: string, data: Partial<Association>) => {
    updateAssociation(id, data);
  };

  const handleDeleteAssociation = (id: string) => {
    deleteAssociation(id);
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
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => setUsePagination(!usePagination)}
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
                        onClick={manuallyRefresh}
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

            {usePagination ? (
              <Tabs defaultValue="all">
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
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    All
                    <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {filteredAssociations.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active
                    <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
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
                  <AssociationTable associations={filteredAssociations} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="active">
                  <AssociationTable associations={activeAssociations} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="inactive">
                  <AssociationTable associations={inactiveAssociations} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Associations;
