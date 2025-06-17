
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyTypeConfigurationAlertProps {
  associationName: string;
  associationId: string;
  importType: string;
}

const PropertyTypeConfigurationAlert: React.FC<PropertyTypeConfigurationAlertProps> = ({
  associationName,
  associationId,
  importType
}) => {
  // Only show for property-related imports
  if (!['properties', 'properties_owners'].includes(importType)) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        <div className="space-y-3">
          <div>
            <strong>Property Type Configuration Required:</strong> The association "{associationName}" 
            doesn't have a default property type configured. You have two options:
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Option 1:</span>
              <span>Configure the association's property type to enable automatic mapping</span>
              <Link to={`/system/associations/${associationId}`}>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Association
                </Button>
              </Link>
            </div>
            
            <div>
              <span className="font-medium">Option 2:</span>
              <span>Manually map the "Property Type" column from your import file below</span>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PropertyTypeConfigurationAlert;
