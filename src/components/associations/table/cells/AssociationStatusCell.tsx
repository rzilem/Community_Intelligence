
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Association } from '@/types/association-types';

interface AssociationStatusCellProps {
  association: Association;
}

export const AssociationStatusCell: React.FC<AssociationStatusCellProps> = ({
  association
}) => {
  if (!association.is_archived) {
    return (
      <Badge 
        variant="outline" 
        className="bg-green-50 text-green-700 hover:bg-green-50"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className="bg-gray-50 text-gray-700 hover:bg-gray-50"
    >
      Inactive
    </Badge>
  );
};
