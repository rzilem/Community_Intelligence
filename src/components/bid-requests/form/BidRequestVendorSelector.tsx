
import React, { useState } from 'react';
import { FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Vendor } from '@/types/vendor-types';

interface BidRequestVendorSelectorProps {
  eligibleVendors: Vendor[];
  selectedVendors: string[];
  onVendorsChange: (vendors: string[]) => void;
}

const BidRequestVendorSelector: React.FC<BidRequestVendorSelectorProps> = ({
  eligibleVendors,
  selectedVendors,
  onVendorsChange
}) => {
  const handleVendorSelect = (vendorId: string) => {
    // Prevent duplicate selections
    if (!selectedVendors.includes(vendorId)) {
      onVendorsChange([...selectedVendors, vendorId]);
    }
  };

  const handleVendorRemove = (vendorId: string) => {
    onVendorsChange(selectedVendors.filter(id => id !== vendorId));
  };

  return (
    <>
      <FormItem>
        <FormLabel>Select Eligible Vendors</FormLabel>
        <Select onValueChange={handleVendorSelect}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select vendors to invite" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {eligibleVendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
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
              const vendor = eligibleVendors.find(v => v.id === vendorId);
              return (
                <div 
                  key={vendorId} 
                  className="bg-gray-100 px-2 py-1 rounded-md flex items-center"
                >
                  {vendor?.name}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-5 w-5"
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
