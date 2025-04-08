
import React from 'react';
import { Resident } from './resident-types';
import StandaloneResidentCard from './StandaloneResidentCard';

interface ResidentGridProps {
  residents: Resident[];
}

const ResidentGrid: React.FC<ResidentGridProps> = ({ residents }) => {
  if (residents.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No residents found matching your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {residents.map(resident => (
        <StandaloneResidentCard key={resident.id} resident={resident} />
      ))}
    </div>
  );
};

export default ResidentGrid;
