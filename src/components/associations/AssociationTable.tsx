
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Association } from '@/types/association-types';
import { LoadingState } from '@/components/ui/loading-state';
import ColumnSelector from '@/components/table/ColumnSelector';
import AssociationEditDialog from './AssociationEditDialog';
import { AssociationTableHeader } from './table/components/AssociationTableHeader';
import { AssociationTableRow } from './table/components/AssociationTableRow';
import { AssociationDeleteDialog } from './table/dialogs/AssociationDeleteDialog';
import { ASSOCIATION_TABLE_COLUMNS } from './table/config/association-table-columns';
import { useAssociationTableState } from './table/hooks/useAssociationTableState';
import { useAssociationTableActions } from './table/hooks/useAssociationTableActions';

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
  onViewProfile?: (id: string) => void;
}

const AssociationTable: React.FC<AssociationTableProps> = ({ 
  associations, 
  isLoading, 
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = [],
  onViewProfile
}) => {
  const {
    visibleColumns,
    deleteDialogOpen,
    editDialogOpen,
    selectedAssociation,
    setDeleteDialogOpen,
    setEditDialogOpen,
    setSelectedAssociation,
    handleColumnsChange,
    handleReorderColumns
  } = useAssociationTableState();

  const {
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleConfirmDelete
  } = useAssociationTableActions({
    onEdit,
    onDelete,
    setSelectedAssociation,
    setEditDialogOpen,
    setDeleteDialogOpen
  });

  const isSelected = (association: Association) => {
    return selectedAssociations.some(a => a.id === association.id);
  };

  const handleSelectAll = () => {
    if (selectedAssociations.length === associations.length) {
      // Deselect all - we can't implement this without onToggleSelect for each
      associations.forEach(association => {
        if (onToggleSelect && isSelected(association)) {
          onToggleSelect(association);
        }
      });
    } else {
      // Select all - we can't implement this without onToggleSelect for each
      associations.forEach(association => {
        if (onToggleSelect && !isSelected(association)) {
          onToggleSelect(association);
        }
      });
    }
  };

  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector
          columns={ASSOCIATION_TABLE_COLUMNS}
          selectedColumns={visibleColumns}
          onChange={handleColumnsChange}
          onReorder={handleReorderColumns}
          className="mb-2"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <AssociationTableHeader
            columns={ASSOCIATION_TABLE_COLUMNS}
            visibleColumns={visibleColumns}
            showSelection={!!onToggleSelect}
            onSelectAll={onToggleSelect ? handleSelectAll : undefined}
            isAllSelected={selectedAssociations.length === associations.length && associations.length > 0}
          />
          <TableBody>
            {associations.length === 0 ? (
              <tr>
                <td 
                  colSpan={visibleColumns.length + (onToggleSelect ? 1 : 0)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  No associations found
                </td>
              </tr>
            ) : (
              associations.map((association) => (
                <AssociationTableRow
                  key={association.id}
                  association={association}
                  visibleColumns={visibleColumns}
                  isSelected={isSelected(association)}
                  showSelection={!!onToggleSelect}
                  onToggleSelect={onToggleSelect}
                  onViewProfile={onViewProfile}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssociationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        association={selectedAssociation}
        onConfirm={handleConfirmDelete}
      />

      {selectedAssociation && (
        <AssociationEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          association={selectedAssociation}
          onSave={(data) => handleSaveEdit(data, selectedAssociation)}
        />
      )}
    </>
  );
};

export default AssociationTable;
