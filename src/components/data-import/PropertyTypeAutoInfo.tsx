
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface PropertyTypeAutoInfoProps {
  hasPropertyType: boolean;
  associationPropertyType: string | null;
  importType: string;
  associationId: string;
  isLoading?: boolean;
}

const PropertyTypeAutoInfo: React.FC<PropertyTypeAutoInfoProps> = ({
  hasPropertyType,
  associationPropertyType,
  importType,
  associationId,
  isLoading = false
}) => {
  console.log('PropertyTypeAutoInfo render:', {
    hasPropertyType,
    associationPropertyType,
    importType,
    associationId,
    isLoading
  });

  // Only show for property-related imports
  if (!['properties', 'properties_owners'].includes(importType)) {
    return null;
  }

  // Don't show anything while loading
  if (isLoading) {
    return null;
  }

  // For "All Associations" import, always show info about property type requirement
  if (associationId === 'all') {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Multi-Association Import:</strong> When importing for "All Associations", 
          you must map the "Property Type" column from your file since properties may belong 
          to different associations with different property types.
        </AlertDescription>
      </Alert>
    );
  }

  // Show success message when association has property type configured
  if (hasPropertyType && associationPropertyType) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <div className="flex items-center gap-2 flex-wrap">
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

  // Show warning message when no property type is configured for the specific association
  if (!hasPropertyType && associationId && associationId !== 'all') {
    return (
      <Alert className="border-amber-200 bg-amber-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          <strong>Property Type Mapping Required:</strong> This association doesn't have a default property type configured, 
          so you'll need to map the "Property Type" column from your file below, or configure the association's 
          default property type in the Association settings first.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PropertyTypeAutoInfo;
