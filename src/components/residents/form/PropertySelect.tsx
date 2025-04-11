
import React from 'react';
import { ResidentSelectField } from './ResidentSelectField';
import { Property } from '@/types/property-types';

interface PropertySelectProps {
  properties: Property[];
  selectedPropertyId?: string;
  onChange: (propertyId: string) => void;
  loading: boolean;
}

export const PropertySelect: React.FC<PropertySelectProps> = ({
  properties,
  selectedPropertyId,
  onChange,
  loading
}) => {
  const propertyOptions = properties.map((property) => ({
    value: property.id,
    label: `${property.address} ${property.unit_number ? `Unit ${property.unit_number}` : ''}`
  }));

  return (
    <ResidentSelectField
      id="property_id"
      label="Property"
      placeholder={loading ? "Loading properties..." : "Select a property"}
      options={propertyOptions}
      value={selectedPropertyId || ''}
      onChange={onChange}
    />
  );
};
