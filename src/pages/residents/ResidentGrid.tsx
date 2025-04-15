
import React from 'react';
import { Resident } from './resident-types';
import StandaloneResidentCard from './StandaloneResidentCard';
import { EmptyResidentsState } from '@/components/residents/content/EmptyResidentsState';
import { ResidentLoadingSkeleton } from '@/components/residents/content/ResidentLoadingSkeleton';

interface ResidentGridProps {
  residents: Resident[];
  loading?: boolean;
}

const ResidentGrid: React.FC<ResidentGridProps> = ({ residents, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResidentLoadingSkeleton count={6} />
      </div>
    );
  }

  if (residents.length === 0) {
    return <EmptyResidentsState />;
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
