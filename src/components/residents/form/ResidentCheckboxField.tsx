
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ResidentCheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const ResidentCheckboxField: React.FC<ResidentCheckboxFieldProps> = ({
  id,
  label,
  checked,
  onCheckedChange
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <div className="col-start-2 col-span-3 flex items-center space-x-2">
        <Checkbox 
          id={id} 
          checked={checked} 
          onCheckedChange={(checked) => onCheckedChange(Boolean(checked))}
        />
        <Label 
          htmlFor={id} 
          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>
    </div>
  );
};
