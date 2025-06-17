
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle } from 'lucide-react';

interface PropertyTypeAutoInfoProps {
  hasPropertyType: boolean;
  associationPropertyType: string | null;
  importType: string;
}

const PropertyTypeAutoInfo: React.FC<PropertyTypeAutoInfoProps> = ({
  hasPropertyType,
  associationPropertyType,
  importType
}) => {
  // Only show for property-related imports
  if (!['properties', 'properties_owners'].includes(importType)) {
    return null;
  }

  if (!hasPropertyType) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          <strong>Property Type Required:</strong> This association doesn't have a default property type set. 
          You'll need to map a "Property Type" column from your file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700">
        <strong>Property Type Auto-Applied:</strong> All imported properties will automatically be set to{' '}
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          {associationPropertyType}
        </Badge>{' '}
        (from association settings). No mapping required.
      </AlertDescription>
    </Alert>
  );
};

export default PropertyTypeAutoInfo;
