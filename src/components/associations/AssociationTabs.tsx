
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssociationTable, { associationTableColumns } from './AssociationTable';
import { Association } from '@/types/association-types';
import { LoadingState } from '@/components/ui/loading-state';

interface AssociationTabsProps {
  error: Error | null;
  filteredAssociations: Association[];
  activeAssociations: Association[];
  inactiveAssociations: Association[];
  isLoading: boolean;
  onEdit: (id: string, data: Partial<Association>) => void;
  onDelete: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
  onViewProfile?: (id: string) => void;
}

const AssociationTabs: React.FC<AssociationTabsProps> = ({
  error,
  filteredAssociations,
  activeAssociations,
  inactiveAssociations,
  isLoading,
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = [],
  onViewProfile
}) => {
  // Restore saved column preferences on initial render
  useEffect(() => {
    // This effect just ensures we have initialized the columns
    const savedColumns = localStorage.getItem('associationTableColumns');
    if (!savedColumns) {
      // If no saved preferences, set defaults
      localStorage.setItem('associationTableColumns', JSON.stringify(
        associationTableColumns.filter(col => ['name', 'property_type', 'location', 'contact_email', 'status', 'actions'].includes(col.id)).map(col => col.id)
      ));
    }
  }, []);

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="mb-4 w-full sm:w-auto">
        <TabsTrigger value="active" className="relative">
          Active
          {activeAssociations.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
              {activeAssociations.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="inactive" className="relative">
          Inactive
          {inactiveAssociations.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-muted text-muted-foreground rounded-full">
              {inactiveAssociations.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all">
          All
          {filteredAssociations.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-muted text-muted-foreground rounded-full">
              {filteredAssociations.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {isLoading ? (
        <LoadingState variant="skeleton" count={3} />
      ) : (
        <>
          <TabsContent value="active" className="m-0">
            <AssociationTable 
              associations={activeAssociations} 
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelect={onToggleSelect}
              selectedAssociations={selectedAssociations}
              onViewProfile={onViewProfile}
            />
          </TabsContent>
          
          <TabsContent value="inactive" className="m-0">
            <AssociationTable 
              associations={inactiveAssociations} 
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelect={onToggleSelect}
              selectedAssociations={selectedAssociations}
              onViewProfile={onViewProfile}
            />
          </TabsContent>
          
          <TabsContent value="all" className="m-0">
            <AssociationTable 
              associations={filteredAssociations} 
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelect={onToggleSelect}
              selectedAssociations={selectedAssociations}
              onViewProfile={onViewProfile}
            />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default AssociationTabs;
