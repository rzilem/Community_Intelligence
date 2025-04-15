
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface AssociationSelectorProps {
  associations: any[];
  selectedAssociationId: string;
  onAssociationChange: (associationId: string) => void;
}

const AssociationSelector: React.FC<AssociationSelectorProps> = ({
  associations,
  selectedAssociationId,
  onAssociationChange
}) => {
  if (associations.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="font-medium text-sm">Association</label>
      <select 
        className="w-full px-3 py-2 border rounded-md"
        value={selectedAssociationId} 
        onChange={(e) => onAssociationChange(e.target.value)}
      >
        <option value="">Select Association</option>
        {associations.map(assoc => (
          <option key={assoc.id} value={assoc.id}>{assoc.name}</option>
        ))}
      </select>
      
      <Alert variant="default" className="mt-2">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Selecting an association will filter the available properties
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AssociationSelector;
