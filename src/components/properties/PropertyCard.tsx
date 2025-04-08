
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/app-types';
import { Building, Users2, ChevronRight, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import TooltipButton from '@/components/ui/tooltip-button';

interface PropertyCardProps {
  property: Property;
  onEdit: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit }) => {
  // Format address with unit number if available
  const formattedAddress = property.unit_number 
    ? `${property.address}, Unit ${property.unit_number}` 
    : property.address;
    
  // Format city, state, zip if available
  const formattedLocation = [property.city, property.state, property.zip]
    .filter(Boolean).join(', ');
    
  // Format property features if available
  const features = [];
  if (property.bedrooms) features.push(`${property.bedrooms} Bed`);
  if (property.bathrooms) features.push(`${property.bathrooms} Bath`);
  if (property.square_feet) features.push(`${property.square_feet} sqft`);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <Building className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground capitalize">{property.property_type}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1" title={formattedAddress}>
              {formattedAddress.length > 30 ? `${formattedAddress.substring(0, 30)}...` : formattedAddress}
            </h3>
            {formattedLocation && (
              <p className="text-sm text-muted-foreground mb-2">{formattedLocation}</p>
            )}
          </div>
          <TooltipButton
            size="icon"
            variant="ghost"
            onClick={onEdit}
            tooltip="Edit property"
          >
            <Edit className="h-4 w-4" />
          </TooltipButton>
        </div>
        
        {features.length > 0 && (
          <div className="flex gap-3 mb-3 mt-2">
            {features.map((feature, index) => (
              <span key={index} className="text-xs bg-secondary/30 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center mt-1 text-sm">
          <Users2 className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
          <span className="text-muted-foreground">
            2 Residents {/* This would be actual data in a real implementation */}
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between">
        <Link 
          to={`/properties/${property.id}/assessments`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Assessments
        </Link>
        <Link 
          to={`/properties/${property.id}`}
          className="text-xs flex items-center text-primary hover:underline"
        >
          Details <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};
