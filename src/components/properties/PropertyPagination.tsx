
import React from 'react';
import { Button } from '@/components/ui/button';

interface PropertyPaginationProps {
  filteredCount: number;
  totalCount: number;
}

export const PropertyPagination: React.FC<PropertyPaginationProps> = ({ 
  filteredCount, 
  totalCount 
}) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} properties
      </p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <Button variant="outline" size="sm" disabled>Next</Button>
      </div>
    </div>
  );
};

export default PropertyPagination;
