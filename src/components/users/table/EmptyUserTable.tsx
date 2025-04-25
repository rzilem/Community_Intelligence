
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

const EmptyUserTable: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-muted-foreground font-medium">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check Supabase authentication permissions or try syncing profiles
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyUserTable;
