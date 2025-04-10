
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import AssociationTable from './AssociationTable';
import { Association } from '@/types/association-types';

interface AssociationTabsProps {
  error: any;
  filteredAssociations: Association[];
  activeAssociations: Association[];
  inactiveAssociations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
}

const AssociationTabs: React.FC<AssociationTabsProps> = ({
  error,
  filteredAssociations,
  activeAssociations,
  inactiveAssociations,
  isLoading,
  onEdit,
  onDelete
}) => {
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading associations. Please try refreshing.
          </AlertDescription>
        </Alert>
      )}
      
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
          <AssociationTable 
            associations={filteredAssociations} 
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <AssociationTable 
            associations={activeAssociations} 
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>
        
        <TabsContent value="inactive">
          <AssociationTable 
            associations={inactiveAssociations} 
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AssociationTabs;
