
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Property {
  id: string;
  address: string;
  unit_number?: string;
}

interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface PropertyResidentSelectorProps {
  properties: Property[];
  residents: Resident[];
  selectedPropertyId?: string;
  selectedResidentId?: string;
  onPropertyChange: (propertyId: string) => void;
  onResidentChange: (residentId: string) => void;
  disabled?: boolean;
}

export default function PropertyResidentSelector({
  properties,
  residents,
  selectedPropertyId,
  selectedResidentId,
  onPropertyChange,
  onResidentChange,
  disabled = false
}: PropertyResidentSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="property">Property</Label>
        <Select 
          value={selectedPropertyId} 
          onValueChange={onPropertyChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.address}
                {property.unit_number && ` - Unit ${property.unit_number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="resident">Resident (Optional)</Label>
        <Select 
          value={selectedResidentId} 
          onValueChange={onResidentChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resident" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No specific resident</SelectItem>
            {residents.map((resident) => (
              <SelectItem key={resident.id} value={resident.id}>
                {resident.first_name} {resident.last_name} ({resident.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
