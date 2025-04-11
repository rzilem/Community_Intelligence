
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface EmptyRequestsRowProps {
  columnsCount: number;
}

const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({ columnsCount }) => {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount + 1} className="h-24 text-center">
        No requests found.
      </TableCell>
    </TableRow>
  );
};

export default EmptyRequestsRow;
