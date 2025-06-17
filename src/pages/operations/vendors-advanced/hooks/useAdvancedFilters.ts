
import { useState, useEffect } from 'react';
import { Vendor } from '@/types/vendor-types';

export const useAdvancedFilters = (vendors: Vendor[]) => {
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    let filtered = vendors;

    if (searchFilters.specialties?.length > 0) {
      filtered = filtered.filter(vendor => 
        vendor.specialties?.some(specialty => 
          searchFilters.specialties.includes(specialty)
        )
      );
    }

    if (searchFilters.ratings?.length > 0) {
      const [minRating, maxRating] = searchFilters.ratings;
      filtered = filtered.filter(vendor => 
        vendor.rating && vendor.rating >= minRating && vendor.rating <= maxRating
      );
    }

    if (searchFilters.verified) {
      filtered = filtered.filter(vendor => vendor.is_active);
    }

    if (searchFilters.emergency24h) {
      filtered = filtered.filter(vendor => 
        vendor.average_response_time && vendor.average_response_time <= 2
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, searchFilters]);

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
  };

  const handleSaveSearch = (searchName: string, filters: any) => {
    console.log('Saving search:', searchName, filters);
  };

  const handleCreateAlert = (filters: any) => {
    console.log('Creating alert for filters:', filters);
  };

  return {
    searchFilters,
    filteredVendors,
    handleFiltersChange,
    handleSaveSearch,
    handleCreateAlert
  };
};
