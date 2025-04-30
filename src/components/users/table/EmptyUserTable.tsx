
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

const EmptyUserTable: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={3} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-muted-foreground">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new user or sync missing profiles
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyUserTable;
