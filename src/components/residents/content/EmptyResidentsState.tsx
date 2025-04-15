
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface EmptyResidentsStateProps {
  onAddClick?: () => void;
}

export const EmptyResidentsState: React.FC<EmptyResidentsStateProps> = ({ onAddClick }) => {
  return (
    <div className="text-center py-10 px-4 border rounded-md bg-muted/20">
      <h3 className="text-lg font-medium mb-2">No residents found</h3>
      <p className="text-muted-foreground mb-6">
        There are no residents matching your current filters.
      </p>
      {onAddClick && (
        <Button onClick={onAddClick} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Resident
        </Button>
      )}
    </div>
  );
};
