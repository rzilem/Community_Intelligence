
import { useMemo, useState } from 'react';
import { Vendor } from '@/types/vendor-types';
import { useSortableTable } from '@/hooks/vendors/useSortableTable';
import type { AdvancedFilters } from '../VendorAdvancedFilters';

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  minRating: 0,
  maxRating: 5,
  minJobs: 0,
  maxJobs: 999,
  hasEmail: null,
  hasPhone: null,
  selectedSpecialties: []
};

export const useVendorFilters = (vendors: Vendor[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all_specialties');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);

  // First apply basic filters
  const basicFilteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );

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

  // Then apply advanced filters
  const advancedFilteredVendors = useMemo(() => {
    return basicFilteredVendors.filter(vendor => {
      // Rating filter
      const vendorRating = vendor.rating || 0;
      if (vendorRating < advancedFilters.minRating || vendorRating > advancedFilters.maxRating) {
        return false;
      }

      // Jobs count filter
      const vendorJobs = vendor.total_jobs || 0;
      if (vendorJobs < advancedFilters.minJobs || vendorJobs > advancedFilters.maxJobs) {
        return false;
      }

      // Email filter
      if (advancedFilters.hasEmail !== null) {
        const hasEmail = !!(vendor.email && vendor.email.trim());
        if (hasEmail !== advancedFilters.hasEmail) {
          return false;
        }
      }

      // Phone filter
      if (advancedFilters.hasPhone !== null) {
        const hasPhone = !!(vendor.phone && vendor.phone.trim());
        if (hasPhone !== advancedFilters.hasPhone) {
          return false;
        }
      }

      // Specialties filter
      if (advancedFilters.selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = vendor.specialties?.some(specialty =>
          advancedFilters.selectedSpecialties.includes(specialty)
        );
        if (!hasMatchingSpecialty) {
          return false;
        }
      }

      return true;
    });
  }, [basicFilteredVendors, advancedFilters]);

  // Use the sortable table hook
  const { sortedData: filteredVendors, sortConfig, handleSort, clearSort } = useSortableTable(
    advancedFilteredVendors,
    { key: 'name', direction: 'asc' }
  );

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || specialtyFilter !== 'all_specialties';
  
  const hasActiveAdvancedFilters = 
    advancedFilters.minRating !== DEFAULT_ADVANCED_FILTERS.minRating ||
    advancedFilters.maxRating !== DEFAULT_ADVANCED_FILTERS.maxRating ||
    advancedFilters.minJobs !== DEFAULT_ADVANCED_FILTERS.minJobs ||
    advancedFilters.maxJobs !== DEFAULT_ADVANCED_FILTERS.maxJobs ||
    advancedFilters.hasEmail !== DEFAULT_ADVANCED_FILTERS.hasEmail ||
    advancedFilters.hasPhone !== DEFAULT_ADVANCED_FILTERS.hasPhone ||
    advancedFilters.selectedSpecialties.length > 0;

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSpecialtyFilter('all_specialties');
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
    clearSort();
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    advancedFilters,
    setAdvancedFilters,
    filteredVendors,
    hasActiveFilters,
    hasActiveAdvancedFilters,
    handleClearFilters,
    handleClearAdvancedFilters,
    sortConfig,
    handleSort,
    clearSort
  };
};
