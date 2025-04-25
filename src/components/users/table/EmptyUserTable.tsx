
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyUserTableProps {
  onCreateUser?: () => void;
}

const EmptyUserTable: React.FC<EmptyUserTableProps> = ({ onCreateUser }) => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-muted-foreground font-medium">No users found</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            You can create new users directly in this application using the "Create User" button,
            which doesn't require Supabase admin privileges.
          </p>
          
          {onCreateUser && (
            <Button onClick={onCreateUser} className="mt-4" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyUserTable;
