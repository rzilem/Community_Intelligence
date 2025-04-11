
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResidentFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const ResidentFormField: React.FC<ResidentFormFieldProps> = ({
  id,
  label,
  children,
  error
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <div className="col-span-3">
        {children}
        {error && (
          <p className="text-destructive text-sm mt-1">{error}</p>
        )}
      </div>
    </div>
  );
};
