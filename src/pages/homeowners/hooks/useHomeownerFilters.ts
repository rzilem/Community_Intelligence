
import { useState } from 'react';

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

  // Since we're now using server-side filtering via Supabase queries,
  // we'll just pass through the residents array.
  // The actual filtering is done via the Supabase queries
  const filteredHomeowners = residents;

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
