
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';

interface JournalEntriesHeaderProps {
  onAssociationChange: (associationId: string) => void;
}

const JournalEntriesHeader: React.FC<JournalEntriesHeaderProps> = ({ onAssociationChange }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <CardTitle>Journal Entries</CardTitle>
        <CardDescription>Create and manage journal entries for accounting adjustments</CardDescription>
      </div>
      <AssociationSelector 
        className="md:self-end" 
        onAssociationChange={onAssociationChange} 
      />
    </div>
  );
};

export default JournalEntriesHeader;
