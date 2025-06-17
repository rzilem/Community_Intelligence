
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Association } from '@/types/association-types';
import { AssociationNameCell } from '../cells/AssociationNameCell';
import { AssociationStatusCell } from '../cells/AssociationStatusCell';
import { AssociationActionsCell } from '../cells/AssociationActionsCell';
import { formatDate, formatLocation, getContactInfo, getUnitsDisplay, getPropertyType } from '../utils/association-table-utils';

interface AssociationTableRowProps {
  association: Association;
  visibleColumns: string[];
  isSelected?: boolean;
  showSelection?: boolean;
  onToggleSelect?: (association: Association) => void;
  onViewProfile?: (id: string) => void;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
}

export const AssociationTableRow: React.FC<AssociationTableRowProps> = React.memo(({
  association,
  visibleColumns,
  isSelected,
  showSelection,
  onToggleSelect,
  onViewProfile,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      {showSelection && (
        <TableCell>
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(association)}
            aria-label={`Select ${association.name}`}
          />
        </TableCell>
      )}
      
      {visibleColumns.includes('name') && (
        <TableCell>
          <AssociationNameCell 
            association={association} 
            onViewProfile={onViewProfile}
          />
        </TableCell>
      )}
      
      {visibleColumns.includes('property_type') && (
        <TableCell>{getPropertyType(association)}</TableCell>
      )}
      
      {visibleColumns.includes('location') && (
        <TableCell>{formatLocation(association)}</TableCell>
      )}
      
      {visibleColumns.includes('contact_email') && (
        <TableCell>{getContactInfo(association)}</TableCell>
      )}
      
      {visibleColumns.includes('total_units') && (
        <TableCell>{getUnitsDisplay(association)}</TableCell>
      )}
      
      {visibleColumns.includes('phone') && (
        <TableCell>{association.phone || 'N/A'}</TableCell>
      )}
      
      {visibleColumns.includes('created_at') && (
        <TableCell>{formatDate(association.created_at)}</TableCell>
      )}
      
      {visibleColumns.includes('founded_date') && (
        <TableCell>{association.founded_date || 'N/A'}</TableCell>
      )}
      
      {visibleColumns.includes('insurance_expiration') && (
        <TableCell>{association.insurance_expiration || 'N/A'}</TableCell>
      )}
      
      {visibleColumns.includes('fire_inspection_due') && (
        <TableCell>{association.fire_inspection_due || 'N/A'}</TableCell>
      )}
      
      {visibleColumns.includes('status') && (
        <TableCell>
          <AssociationStatusCell association={association} />
        </TableCell>
      )}
      
      {visibleColumns.includes('actions') && (
        <TableCell>
          <AssociationActionsCell 
            association={association}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TableCell>
      )}
    </TableRow>
  );
});

AssociationTableRow.displayName = 'AssociationTableRow';
