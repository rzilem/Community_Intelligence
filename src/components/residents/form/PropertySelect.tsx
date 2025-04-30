
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/spinner';
import { usePropertyList } from '@/hooks/properties/usePropertyList';

interface PropertySelectProps {
  associationId?: string;
  propertyId?: string;
  onChange: (propertyId: string) => void;
}

const PropertySelect: React.FC<PropertySelectProps> = ({ associationId, propertyId, onChange }) => {
  const [selectedProperty, setSelectedProperty] = useState<string>(propertyId || '');

  useEffect(() => {
    if (propertyId) {
      setSelectedProperty(propertyId);
    }
  }, [propertyId]);

  const { properties, isLoading, error } = usePropertyList(associationId);

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
    onChange(value);
  };

  return (
    <div>
      <Label htmlFor="property">Property</Label>
      <Select onValueChange={handlePropertyChange} defaultValue={selectedProperty}>
        <SelectTrigger id="property">
          <SelectValue placeholder="Select a property" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <LoadingSpinner size="sm" /> Loading...
            </SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>
              Error loading properties
            </SelectItem>
          ) : (
            properties?.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.address}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertySelect;
