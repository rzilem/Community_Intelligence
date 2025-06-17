
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info } from 'lucide-react';

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

  // Show success message when association has property type configured
  if (hasPropertyType && associationPropertyType) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <div className="flex items-center gap-2">
            <span>
              <strong>Property Type Auto-Applied:</strong> All imported properties will automatically be set as
            </span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {associationPropertyType}
            </Badge>
            <span>since this association has a default property type configured.</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show info message when no property type is configured
  if (!hasPropertyType) {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Property Type Mapping Required:</strong> This association doesn't have a default property type configured, 
          so you'll need to map the "Property Type" column from your file below, or configure the association's 
          default property type in the Association settings.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PropertyTypeAutoInfo;
