
import { useState, useEffect, useCallback } from 'react';
import { FormattedResident, AssociationData } from './types/resident-types';
import { residentFetchService } from './services/resident-fetch-service';
import { residentFormatterService } from './services/resident-formatter-service';
import { performanceMonitor } from './services/performance-monitor-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizedDataState {
  residents: FormattedResident[];
  associations: AssociationData[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  lastFetchTime: number | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 1000; // Optimized for large datasets

export const useOptimizedHomeownersData = () => {
  const [state, setState] = useState<OptimizedDataState>({
    residents: [],
    associations: [],
    loading: false,
    error: null,
    totalCount: 0,
    lastFetchTime: null
  });

  // Cache for avoiding unnecessary re-fetches
  const shouldRefetch = useCallback(() => {
    if (!state.lastFetchTime) return true;
    return Date.now() - state.lastFetchTime > CACHE_DURATION;
  }, [state.lastFetchTime]);

  const fetchAssociations = useCallback(async (): Promise<AssociationData[]> => {
    const operationId = performanceMonitor.startOperation('fetchAssociations');
    
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('id, name')
        .order('name');

      if (error) throw error;

      performanceMonitor.endOperation(operationId);
      return data || [];
    } catch (error) {
      performanceMonitor.endOperation(operationId);
      throw error;
    }
  }, []);

  const fetchResidentsByAssociationId = useCallback(async (associationIds?: string[]) => {
    if (!shouldRefetch() && state.residents.length > 0) {
      return; // Use cached data
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const operationId = performanceMonitor.startOperation('fetchResidentsOptimized', {
      associationCount: associationIds?.length || 0,
      batchSize: BATCH_SIZE
    });

    try {
      // Fetch associations first
      const associations = await fetchAssociations();
      
      // Determine which associations to fetch
      const targetAssociationIds = associationIds?.length 
        ? associationIds 
        : associations.map(a => a.id);

      if (targetAssociationIds.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          residents: [],
          associations,
          totalCount: 0,
          lastFetchTime: Date.now()
        }));
        return;
      }

      // Fetch properties in optimized batches
      const properties = await residentFetchService.fetchPropertiesByAssociations(targetAssociationIds);
      
      if (properties.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          residents: [],
          associations,
          totalCount: 0,
          lastFetchTime: Date.now()
        }));
        return;
      }

      // Extract property IDs for resident fetching
      const propertyIds = properties.map(p => p.id);

      // Fetch residents in optimized batches
      const residents = await residentFetchService.fetchResidentsBatched(propertyIds, BATCH_SIZE);

      // Format the data
      const formattedResidents = residentFormatterService.formatResidentsData(
        residents,
        properties,
        associations
      );

      setState(prev => ({
        ...prev,
        loading: false,
        residents: formattedResidents,
        associations,
        totalCount: formattedResidents.length,
        lastFetchTime: Date.now()
      }));

      performanceMonitor.endOperation(operationId);
      
      // Log performance metrics for monitoring
      console.log(`Loaded ${formattedResidents.length} residents from ${properties.length} properties`);
      
    } catch (error) {
      console.error('Error fetching residents:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load residents'
      }));
      
      performanceMonitor.endOperation(operationId);
      toast.error('Failed to load homeowner data');
    }
  }, [shouldRefetch, state.residents.length, fetchAssociations]);

  // Initial load
  useEffect(() => {
    fetchResidentsByAssociationId();
  }, []);

  // Force refresh method
  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, lastFetchTime: null }));
    fetchResidentsByAssociationId();
  }, [fetchResidentsByAssociationId]);

  return {
    residents: state.residents,
    associations: state.associations,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    fetchResidentsByAssociationId,
    refreshData,
    // Additional optimization info
    isDataCached: !shouldRefetch() && state.residents.length > 0,
    lastFetchTime: state.lastFetchTime
  };
};
