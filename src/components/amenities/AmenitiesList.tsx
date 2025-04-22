
import React from 'react';
import { Button } from '@/components/ui/button';
import { Amenity } from '@/types/amenity-types';
import { Trash2, Home } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AmenitiesListProps {
  amenities: Amenity[];
  isLoading: boolean;
  selectedAmenityId?: string;
  onSelectAmenity: (amenity: Amenity) => void;
  onDeleteAmenity?: (id: string) => Promise<boolean>;
}

const AmenitiesList: React.FC<AmenitiesListProps> = ({
  amenities,
  isLoading,
  selectedAmenityId,
  onSelectAmenity,
  onDeleteAmenity
}) => {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteAmenity && window.confirm('Are you sure you want to delete this amenity?')) {
      await onDeleteAmenity(id);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading amenities...</div>;
  }

  if (!amenities.length) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No amenities available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {amenities.map((amenity) => (
          <Button
            key={amenity.id}
            variant={selectedAmenityId === amenity.id ? "default" : "outline"}
            className="w-full justify-start h-auto py-3 px-4"
            onClick={() => onSelectAmenity(amenity)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start gap-2">
                <Home className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">{amenity.name}</div>
                  {amenity.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {amenity.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {amenity.capacity && (
                      <Badge variant="outline" className="text-xs">
                        Capacity: {amenity.capacity}
                      </Badge>
                    )}
                    {amenity.booking_fee && (
                      <Badge variant="outline" className="text-xs">
                        Fee: ${amenity.booking_fee}
                      </Badge>
                    )}
                    {amenity.requires_approval && (
                      <Badge variant="outline" className="text-xs bg-yellow-50">
                        Approval Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {onDeleteAmenity && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 ml-2"
                  onClick={(e) => handleDelete(e, amenity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AmenitiesList;
