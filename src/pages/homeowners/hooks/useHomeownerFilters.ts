
import { useState, useMemo } from 'react';
import { FormattedResident } from './types/resident-types';
import { enhancedSearchService } from './services/enhanced-search-service';
import { performanceMonitor } from './services/performance-monitor-service';

export const useHomeownerFilters = (homeowners: FormattedResident[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showBalanceOnly, setShowBalanceOnly] = useState(false);
  const [showViolationsOnly, setShowViolationsOnly] = useState(false);

  const filteredHomeowners = useMemo(() => {
    const operationId = performanceMonitor.startOperation('filterHomeowners', {
      searchTerm,
      filterAssociation,
      filterStatus,
      filterType,
      showBalanceOnly,
      showViolationsOnly,
      totalHomeowners: homeowners.length
    });

    const filtered = enhancedSearchService.search(homeowners, {
      searchTerm,
      statusFilter: filterStatus,
      associationFilter: filterAssociation,
      typeFilter: filterType,
      hasBalance: showBalanceOnly,
      hasViolations: showViolationsOnly
    });

    performanceMonitor.endOperation(operationId);
    return filtered;
  }, [
    homeowners, 
    searchTerm, 
    filterStatus, 
    filterAssociation, 
    filterType, 
    showBalanceOnly, 
    showViolationsOnly
  ]);

  // Search suggestions for autocomplete
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return enhancedSearchService.getSearchSuggestions(searchTerm, 5);
  }, [searchTerm]);

  // Advanced search with relevance scoring
  const searchWithRelevance = (term: string) => {
    return enhancedSearchService.searchWithRelevance(homeowners, term);
  };

  return {
    // Filter states
    searchTerm,
    setSearchTerm,
    filterAssociation,
    setFilterAssociation,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    showBalanceOnly,
    setShowBalanceOnly,
    showViolationsOnly,
    setShowViolationsOnly,
    
    // Results
    filteredHomeowners,
    searchSuggestions,
    searchWithRelevance,
    
    // Utility functions
    clearAllFilters: () => {
      setSearchTerm('');
      setFilterAssociation('all');
      setFilterStatus('all');
      setFilterType('all');
      setShowBalanceOnly(false);
      setShowViolationsOnly(false);
    },
    
    // Stats
    totalCount: homeowners.length,
    filteredCount: filteredHomeowners.length,
    isFiltered: searchTerm || filterAssociation !== 'all' || filterStatus !== 'all' || 
                filterType !== 'all' || showBalanceOnly || showViolationsOnly
  };
};
