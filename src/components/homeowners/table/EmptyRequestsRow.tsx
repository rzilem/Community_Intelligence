
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';

interface EmptyRequestsRowProps {
  columnsCount: number;
  message?: string;
}

const EmptyRequestsRow: React.FC<EmptyRequestsRowProps> = ({ 
  columnsCount, 
  message = "No requests found." 
}) => {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount + 1} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>{message}</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or create a new request.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyRequestsRow;
