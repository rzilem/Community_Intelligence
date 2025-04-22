
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormAssociations } from '@/hooks/form-builder/useFormAssociations';

interface FormAssociationSelectProps {
  formId: string;
  associations: { id: string; name: string }[];
  onUpdate: (isGlobal: boolean, associationIds: string[]) => void;
  isGlobal?: boolean;
}

export function FormAssociationSelect({ 
  formId, 
  associations,
  onUpdate,
  isGlobal = false 
}: FormAssociationSelectProps) {
  const { associations: selectedAssociations, updateAssociations } = useFormAssociations(formId);
  const selectedIds = selectedAssociations.map(a => a.association_id);

  const handleGlobalChange = (checked: boolean) => {
    onUpdate(checked, checked ? [] : selectedIds);
  };

  const handleAssociationChange = (associationId: string, checked: boolean) => {
    const newIds = checked 
      ? [...selectedIds, associationId]
      : selectedIds.filter(id => id !== associationId);
    
    onUpdate(false, newIds);
    updateAssociations(newIds);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is-global"
          checked={isGlobal}
          onCheckedChange={handleGlobalChange}
        />
        <Label htmlFor="is-global">Make this form available to all associations</Label>
      </div>

      {!isGlobal && (
        <div className="space-y-2">
          <Label>Select associations for this form:</Label>
          <div className="grid gap-2 mt-2">
            {associations.map((association) => (
              <div key={association.id} className="flex items-center space-x-2">
                <Checkbox
                  id={association.id}
                  checked={selectedIds.includes(association.id)}
                  onCheckedChange={(checked) => 
                    handleAssociationChange(association.id, checked as boolean)
                  }
                />
                <Label htmlFor={association.id}>{association.name}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
