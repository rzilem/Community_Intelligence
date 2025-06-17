
import React from 'react';
import { Link } from 'react-router-dom';
import { Association } from '@/types/association-types';

interface AssociationNameCellProps {
  association: Association;
  onViewProfile?: (id: string) => void;
}

export const AssociationNameCell: React.FC<AssociationNameCellProps> = ({
  association,
  onViewProfile
}) => {
  if (onViewProfile) {
    return (
      <button 
        onClick={() => onViewProfile(association.id)} 
        className="font-medium hover:underline text-left"
      >
        {association.name}
      </button>
    );
  }

  return (
    <Link 
      to={`/system/associations/${association.id}`} 
      className="font-medium hover:underline"
    >
      {association.name}
    </Link>
  );
};
