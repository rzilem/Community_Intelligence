
import React, { useState, useEffect } from 'react';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vendor } from '@/types/vendor-types';
import { CategoryMatchingService } from '@/services/category-matching-service';
import { getCategoryDisplayName } from '@/constants/category-mappings';

interface BidRequestVendorSelectorProps {
  eligibleVendors: Vendor[];
  selectedVendors: string[];
  onVendorsChange: (vendors: string[]) => void;
  bidRequestCategory?: string;
}

const BidRequestVendorSelector: React.FC<BidRequestVendorSelectorProps> = ({
  eligibleVendors,
  selectedVendors,
  onVendorsChange,
  bidRequestCategory
}) => {
  const [vendorMatches, setVendorMatches] = useState<any[]>([]);

  useEffect(() => {
    if (bidRequestCategory && eligibleVendors.length > 0) {
      const matches = CategoryMatchingService.findMatchingVendors(eligibleVendors, bidRequestCategory);
      setVendorMatches(matches);
    } else {
      setVendorMatches(eligibleVendors.map(vendor => ({ vendor, matchScore: 0, matchingSpecialties: [] })));
    }
  }, [eligibleVendors, bidRequestCategory]);

  const handleVendorSelect = (vendorId: string) => {
    if (!selectedVendors.includes(vendorId)) {
      onVendorsChange([...selectedVendors, vendorId]);
    }
  };

  const handleVendorRemove = (vendorId: string) => {
    onVendorsChange(selectedVendors.filter(id => id !== vendorId));
  };

  return (
    <>
      {bidRequestCategory && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-900 mb-1">
            Category: {getCategoryDisplayName(bidRequestCategory)}
          </h4>
          <p className="text-sm text-blue-700">
            Vendors are filtered and ranked based on their specialties that match this category.
          </p>
        </div>
      )}

      <FormItem>
        <FormLabel>Select Eligible Vendors</FormLabel>
        <Select onValueChange={handleVendorSelect}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select vendors to invite" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {vendorMatches.map(({ vendor, matchScore, matchingSpecialties }) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{vendor.name}</span>
                  {matchScore > 0 && (
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(matchScore * 100)}% match
                      </Badge>
                      {matchingSpecialties.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({matchingSpecialties.join(', ')})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      {selectedVendors.length > 0 && (
        <div>
          <FormLabel>Selected Vendors</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedVendors.map((vendorId) => {
              const vendorMatch = vendorMatches.find(m => m.vendor.id === vendorId);
              const vendor = vendorMatch?.vendor;
              if (!vendor) return null;

              return (
                <div 
                  key={vendorId} 
                  className="bg-gray-100 px-3 py-2 rounded-md flex items-center gap-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{vendor.name}</span>
                    {vendorMatch.matchingSpecialties.length > 0 && (
                      <span className="text-xs text-gray-600">
                        {vendorMatch.matchingSpecialties.join(', ')}
                      </span>
                    )}
                  </div>
                  {vendorMatch.matchScore > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(vendorMatch.matchScore * 100)}%
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => handleVendorRemove(vendorId)}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default BidRequestVendorSelector;
