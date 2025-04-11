
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Association } from '@/types/association-types';

interface CriticalDatesProps {
  association: Association;
}

export const CriticalDates: React.FC<CriticalDatesProps> = ({ association }) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Critical Dates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Insurance Expiration</p>
              <p className="font-semibold text-lg">{association.insurance_expiration || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Fire Inspection Due</p>
              <p className="font-semibold text-lg">{association.fire_inspection_due || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
