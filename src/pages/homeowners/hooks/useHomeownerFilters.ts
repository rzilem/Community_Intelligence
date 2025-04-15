
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
    return residents.filter(homeowner => {
      const matchesSearch = 
        homeowner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        homeowner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (homeowner.propertyAddress && homeowner.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesAssociation = filterAssociation === 'all' || homeowner.association === filterAssociation;
      const matchesStatus = filterStatus === 'all' || homeowner.status === filterStatus;
      const matchesType = filterType === 'all' || homeowner.type === filterType;
      
      return matchesSearch && matchesAssociation && matchesStatus && matchesType;
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

