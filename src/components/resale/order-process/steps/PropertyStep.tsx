
import React from 'react';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';
import { PropertySearchCombobox } from '@/components/resale/PropertySearchCombobox';
import { Property } from '@/types/property-types';
import { UseFormReturn } from 'react-hook-form';
import { ResaleOrderFormData } from '@/hooks/resale/useResaleOrderForm';

interface PropertyStepProps {
  onPropertySelect: (property: Property | null) => void;
  form: UseFormReturn<ResaleOrderFormData>;
}

export const PropertyStep = ({ form, onPropertySelect }: PropertyStepProps) => {
  const propertyInfo = form.watch('propertyInfo');
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Property Address</Label>
        <PropertySearchCombobox
          onPropertySelect={onPropertySelect}
          value={propertyInfo.address ? 
            `${propertyInfo.address}${propertyInfo.unit ? ` Unit ${propertyInfo.unit}` : ''}, ${propertyInfo.city}, ${propertyInfo.state} ${propertyInfo.zip}`
            : undefined
          }
        />
      </div>
      
      {propertyInfo.address && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Selected Property Details
          </h3>
          <div className="text-sm space-y-1">
            <p>Address: {propertyInfo.address}</p>
            {propertyInfo.unit && <p>Unit: {propertyInfo.unit}</p>}
            <p>Location: {propertyInfo.city}, {propertyInfo.state} {propertyInfo.zip}</p>
          </div>
        </div>
      )}
    </div>
  );
};
