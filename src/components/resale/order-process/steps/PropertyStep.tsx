
import React from 'react';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';
import { PropertySearchCombobox } from '@/components/resale/PropertySearchCombobox';
import { Property } from '@/types/property-types';

interface PropertyStepProps {
  formData: any;
  onPropertySelect: (property: Property | null) => void;
}

export const PropertyStep = ({ formData, onPropertySelect }: PropertyStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Property Address</Label>
        <PropertySearchCombobox
          onPropertySelect={onPropertySelect}
          value={formData.propertyInfo.address ? 
            `${formData.propertyInfo.address}${formData.propertyInfo.unit ? ` Unit ${formData.propertyInfo.unit}` : ''}, ${formData.propertyInfo.city}, ${formData.propertyInfo.state} ${formData.propertyInfo.zip}`
            : undefined
          }
        />
      </div>
      
      {formData.propertyInfo.address && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Selected Property Details
          </h3>
          <div className="text-sm space-y-1">
            <p>Address: {formData.propertyInfo.address}</p>
            {formData.propertyInfo.unit && <p>Unit: {formData.propertyInfo.unit}</p>}
            <p>Location: {formData.propertyInfo.city}, {formData.propertyInfo.state} {formData.propertyInfo.zip}</p>
          </div>
        </div>
      )}
    </div>
  );
};
