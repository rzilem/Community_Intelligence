
import { useState, useMemo } from 'react';
import { FormattedResident } from './types/resident-types';
import { residentSearchService } from './services/resident-search-service';
import { performanceMonitor } from './services/performance-monitor-service';

export const useHomeownerFilters = (homeowners: FormattedResident[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredHomeowners = useMemo(() => {
    const operationId = performanceMonitor.startOperation('filterHomeowners', {
      searchTerm,
      filterAssociation,
      filterStatus,
      totalHomeowners: homeowners.length
    });

    const filtered = residentSearchService.applyAllFilters(
      homeowners,
      searchTerm,
      filterStatus,
      filterAssociation
    );

    performanceMonitor.endOperation(operationId);
    return filtered;
  }, [homeowners, searchTerm, filterStatus, filterAssociation]);

  return {
    searchTerm,
    setSearchTerm,
    filterAssociation,
    setFilterAssociation,
    filterStatus,
    setFilterStatus,
    filteredHomeowners
  };
};
