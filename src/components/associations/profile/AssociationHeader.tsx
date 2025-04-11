
import React from 'react';
import { MapPin, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Association } from '@/types/association-types';

interface AssociationHeaderProps {
  association: Association;
  handleBack: () => void;
}

export const AssociationHeader: React.FC<AssociationHeaderProps> = ({ 
  association, 
  handleBack 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-4 border-b">
      <div className="flex items-start gap-3">
        <div>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {association.address ? `${association.address}, ` : ''}
              {association.city && association.state ? `${association.city}, ${association.state}` : 'No location data'}
              {association.zip ? ` ${association.zip}` : ''}
              {association.country ? `, ${association.country}` : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={association.is_archived ? "bg-gray-500" : "bg-green-500"}>
          {association.is_archived ? 'Inactive' : 'Active'}
        </Badge>
        <Button onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Associations
        </Button>
      </div>
    </div>
  );
};
