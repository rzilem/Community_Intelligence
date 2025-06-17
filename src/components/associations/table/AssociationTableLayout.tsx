
import React from 'react';
import { Table } from '@/components/ui/table';
import { Association } from '@/types/association-types';
import { LoadingState } from '@/components/ui/loading-state';
import ColumnSelector from '@/components/table/ColumnSelector';
import { AssociationTableHeader } from './components/AssociationTableHeader';
import AssociationTableContent from './AssociationTableContent';
import { ASSOCIATION_TABLE_COLUMNS } from './config/association-table-columns';

interface AssociationTableLayoutProps {
  associations: Association[];
  isLoading: boolean;
  visibleColumns: string[];
  selectedAssociations: Association[];
  showSelection: boolean;
  onColumnsChange: (columns: string[]) => void;
  onReorderColumns: (sourceIndex: number, destinationIndex: number) => void;
  onSelectAll: () => void;
  onToggleSelect?: (association: Association) => void;
  onViewProfile?: (id: string) => void;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
  isSelected: (association: Association) => boolean;
}

const AssociationTableLayout: React.FC<AssociationTableLayoutProps> = ({
  associations,
  isLoading,
  visibleColumns,
  selectedAssociations,
  showSelection,
  onColumnsChange,
  onReorderColumns,
  onSelectAll,
  onToggleSelect,
  onViewProfile,
  onEdit,
  onDelete,
  isSelected
}) => {
  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector
          columns={ASSOCIATION_TABLE_COLUMNS}
          selectedColumns={visibleColumns}
          onChange={onColumnsChange}
          onReorder={onReorderColumns}
          className="mb-2"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <AssociationTableHeader
            columns={ASSOCIATION_TABLE_COLUMNS}
            visibleColumns={visibleColumns}
            showSelection={showSelection}
            onSelectAll={showSelection ? onSelectAll : undefined}
            isAllSelected={selectedAssociations.length === associations.length && associations.length > 0}
          />
          <AssociationTableContent
            associations={associations}
            visibleColumns={visibleColumns}
            showSelection={showSelection}
            onToggleSelect={onToggleSelect}
            onViewProfile={onViewProfile}
            onEdit={onEdit}
            onDelete={onDelete}
            isSelected={isSelected}
          />
        </Table>
      </div>
    </>
  );
};

export default AssociationTableLayout;
