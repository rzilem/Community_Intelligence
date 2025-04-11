
import { useState, useMemo } from 'react';

export const useResidentFilters = (residents: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredResidents = useMemo(() => {
    return residents.filter(resident => {
      const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (resident.email && resident.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         resident.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssociation = filterAssociation === 'all' || resident.association === filterAssociation;
      const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
      const matchesType = filterType === 'all' || resident.type === filterType;
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
