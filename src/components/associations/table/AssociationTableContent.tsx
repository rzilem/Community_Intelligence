
import React from 'react';
import { TableBody } from '@/components/ui/table';
import { Association } from '@/types/association-types';
import { AssociationTableRow } from './components/AssociationTableRow';

interface AssociationTableContentProps {
  associations: Association[];
  visibleColumns: string[];
  showSelection: boolean;
  onToggleSelect?: (association: Association) => void;
  onViewProfile?: (id: string) => void;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
  isSelected: (association: Association) => boolean;
}

const AssociationTableContent: React.FC<AssociationTableContentProps> = ({
  associations,
  visibleColumns,
  showSelection,
  onToggleSelect,
  onViewProfile,
  onEdit,
  onDelete,
  isSelected
}) => {
  return (
    <TableBody>
      {associations.length === 0 ? (
        <tr>
          <td 
            colSpan={visibleColumns.length + (showSelection ? 1 : 0)} 
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
            showSelection={showSelection}
            onToggleSelect={onToggleSelect}
            onViewProfile={onViewProfile}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </TableBody>
  );
};

export default AssociationTableContent;
