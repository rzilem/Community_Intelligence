
import { useState, useEffect, useMemo } from 'react';

export const useResidentFilters = (residents: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Filter residents based on current filter settings
  const filteredResidents = useMemo(() => {
    return residents.filter(resident => {
      // Search term filter
      const matchesSearch = 
        searchTerm === '' || 
        resident.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      // Association filter
      const matchesAssociation = 
        filterAssociation === '' || 
        resident.association === filterAssociation;

      // Status filter
      const matchesStatus = 
        filterStatus === '' || 
        resident.status === filterStatus;

      // Type filter
      const matchesType = 
        filterType === '' || 
        resident.type === filterType;

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
    filteredResidents
  };
};
