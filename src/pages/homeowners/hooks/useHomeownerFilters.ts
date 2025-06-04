import { useState, useMemo } from 'react';

export const useHomeownerFilters = (residents: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Extract just the street address part (without city, state, zip)
  const extractStreetAddress = (fullAddress: string | undefined) => {
    if (!fullAddress) return '';
    // Simple extraction - assumes the street address is before the first comma
    const parts = fullAddress.split(',');
    return parts[0]?.trim() || fullAddress;
  };

  const filteredHomeowners = useMemo(() => {
    // First, filter based on search term and other filters
    let filtered = residents;
    
    if (searchTerm || filterAssociation !== 'all' || filterStatus !== 'all' || filterType !== 'all') {
      filtered = residents.filter(homeowner => {
        const matchesSearch = !searchTerm || 
          homeowner.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          homeowner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (homeowner.propertyAddress && homeowner.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()));
          
        const matchesAssociation = filterAssociation === 'all' || homeowner.association === filterAssociation;
        const matchesStatus = filterStatus === 'all' || homeowner.status === filterStatus;
        const matchesType = filterType === 'all' || homeowner.type === filterType;
        
        return matchesSearch && matchesAssociation && matchesStatus && matchesType;
      });
    }
    
    // Then, deduplicate based on property address
    const uniqueAddresses = new Map();
    
    return filtered.filter(homeowner => {
      // If the homeowner has no property address, keep it
      if (!homeowner.propertyAddress) return true;
      
      // Generate a unique key based on property address and association
      // This ensures that identical addresses in different associations are treated as unique
      const addressKey = `${homeowner.propertyAddress}-${homeowner.association}`;
      
      // If we haven't seen this address before, add it to our map and keep this homeowner
      if (!uniqueAddresses.has(addressKey)) {
        uniqueAddresses.set(addressKey, true);
        return true;
      }
      
      // Otherwise, filter out this duplicate address
      return false;
    });
  }, [residents, searchTerm, filterAssociation, filterStatus, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterAssociation,
    setFilterAssociation,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filteredHomeowners,
    extractStreetAddress
  };
};
