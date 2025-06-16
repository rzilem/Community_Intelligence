
import { useMemo, useState } from 'react';
import { Vendor } from '@/types/vendor-types';

export const useVendorFilters = (vendors: Vendor[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all_specialties');

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && vendor.is_active) ||
        (statusFilter === 'inactive' && !vendor.is_active);

      const matchesSpecialty = specialtyFilter === 'all_specialties' ||
        vendor.specialties?.some(specialty => 
          specialty.toLowerCase().replace(' ', '_') === specialtyFilter
        );

      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [vendors, searchTerm, statusFilter, specialtyFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || specialtyFilter !== 'all_specialties';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSpecialtyFilter('all_specialties');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    filteredVendors,
    hasActiveFilters,
    handleClearFilters
  };
};
