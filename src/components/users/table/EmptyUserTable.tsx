
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

const EmptyUserTable: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
        No users found. Create a new user to get started.
      </TableCell>
    </TableRow>
  );
};

export default EmptyUserTable;
