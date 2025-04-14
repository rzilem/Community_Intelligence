
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Property } from '@/types/app-types';
import { Spinner } from '@/components/ui/spinner';

interface PropertySelectProps {
  properties: Property[];
  selectedPropertyId?: string;
  onChange: (value: string) => void;
  loading: boolean;
}

export const PropertySelect: React.FC<PropertySelectProps> = ({
  properties,
  selectedPropertyId,
  onChange,
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Property</Label>
        <div className="flex items-center h-10 px-3 border rounded-md">
          <Spinner className="h-4 w-4 mr-2" />
          <span className="text-sm text-muted-foreground">Loading properties...</span>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Property</Label>
        <div className="flex items-center h-10 px-3 border rounded-md bg-amber-50">
          <span className="text-sm text-amber-700">
            No properties available. Please add properties first.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Property</Label>
      <Select value={selectedPropertyId} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a property" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.address} {property.unit_number ? `Unit ${property.unit_number}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        This will automatically assign the resident to the correct association
      </p>
    </div>
  );
};
