
import React from 'react';
import { PencilLine, Trash2 } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { Association } from '@/types/association-types';

interface AssociationActionsCellProps {
  association: Association;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
}

export const AssociationActionsCell: React.FC<AssociationActionsCellProps> = ({
  association,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex gap-2">
      <TooltipButton
        size="icon"
        variant="ghost"
        tooltip="Edit Association"
        onClick={() => onEdit(association)}
      >
        <PencilLine className="h-4 w-4" />
      </TooltipButton>
      <TooltipButton
        size="icon"
        variant="ghost"
        tooltip="Delete Association"
        onClick={() => onDelete(association)}
      >
        <Trash2 className="h-4 w-4" />
      </TooltipButton>
    </div>
  );
};
