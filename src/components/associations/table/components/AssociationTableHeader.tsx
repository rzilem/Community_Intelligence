
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AssociationTableColumn } from '../config/association-table-columns';

interface AssociationTableHeaderProps {
  columns: AssociationTableColumn[];
  visibleColumns: string[];
  showSelection?: boolean;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}

export const AssociationTableHeader: React.FC<AssociationTableHeaderProps> = ({
  columns,
  visibleColumns,
  showSelection,
  onSelectAll,
  isAllSelected
}) => {
  return (
    <TableHeader>
      <TableRow>
        {showSelection && (
          <TableHead className="w-[50px]">
            <Checkbox 
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
            />
          </TableHead>
        )}
        {columns
          .filter(col => visibleColumns.includes(col.id))
          .map(column => (
            <TableHead 
              key={column.id}
              className={column.width ? `w-[${column.width}]` : ''}
              style={{ textAlign: column.align || 'left' }}
            >
              {column.label}
            </TableHead>
          ))}
      </TableRow>
    </TableHeader>
  );
};
