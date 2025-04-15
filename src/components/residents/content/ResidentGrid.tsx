
import React from 'react';
import { ResidentWithProfile } from '@/types/app-types';
import { ResidentCard } from './ResidentCard';
import { ResidentLoadingSkeleton } from './ResidentLoadingSkeleton';
import { EmptyResidentsState } from './EmptyResidentsState';
import { ResidentDialog } from '../ResidentDialog';
import { useState } from 'react';

interface ResidentGridProps {
  residents: ResidentWithProfile[];
  loading?: boolean;
  onAddClick?: () => void;
}

export const ResidentGrid: React.FC<ResidentGridProps> = ({ 
  residents, 
  loading = false,
  onAddClick 
}) => {
  const [editingResident, setEditingResident] = useState<ResidentWithProfile | null>(null);

  const handleEdit = (resident: ResidentWithProfile) => {
    setEditingResident(resident);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResidentLoadingSkeleton count={6} />
      </div>
    );
  }

  if (residents.length === 0) {
    return <EmptyResidentsState onAddClick={onAddClick} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {residents.map(resident => (
          <ResidentCard 
            key={resident.id} 
            resident={resident} 
            onEdit={() => handleEdit(resident)}
          />
        ))}
      </div>

      {editingResident && (
        <ResidentDialog
          open={!!editingResident}
          onOpenChange={() => setEditingResident(null)}
          resident={editingResident}
        />
      )}
    </>
  );
};
