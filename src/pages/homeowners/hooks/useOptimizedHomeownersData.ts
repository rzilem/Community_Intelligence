
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import { FormattedResident, AssociationData } from './types/resident-types';
import { residentCacheService } from './services/resident-cache-service';
import { residentFetchService } from './services/resident-fetch-service';
import { residentFormatterService } from './services/resident-formatter-service';
import { performanceMonitor } from './services/performance-monitor-service';

export const useOptimizedHomeownersData = () => {
  const [residents, setResidents] = useState<FormattedResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch associations with explicit typing to avoid TS2589 error
  const associationsQuery = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: [{ column: 'is_archived', operator: 'eq', value: false }],
      order: { column: 'name', ascending: true }
    }
  );

  const associations: AssociationData[] = Array.isArray(associationsQuery.data) 
    ? associationsQuery.data 
    : [];

  useEffect(() => {
    if (associationsQuery.error) {
      console.error("Error loading associations:", associationsQuery.error);
      toast.error("Failed to load associations");
    }
  }, [associationsQuery.error]);

  const fetchResidentsByAssociationId = useCallback(async (associationId: string | null = null) => {
    const operationId = performanceMonitor.startOperation('fetchResidentsByAssociationId', { associationId });
    
    try {
      setLoading(true);
      setError(null);
      
      // Determine association IDs to fetch
      let associationIds: string[] = [];
      
      if (!associationId || associationId === 'all') {
        associationIds = associations.map((a: AssociationData) => a.id);
      } else {
        associationIds = [associationId];
      }
      
      if (associationIds.length === 0) {
        setResidents([]);
        setLoading(false);
        performanceMonitor.endOperation(operationId);
        return;
      }
      
      // Check cache first
      const cachedData = residentCacheService.get(associationIds);
      if (cachedData) {
        console.log('Using cached resident data');
        setResidents(cachedData);
        setLoading(false);
        performanceMonitor.endOperation(operationId);
        return;
      }
      
      // Fetch properties for associations
      const fetchPropertiesId = performanceMonitor.startOperation('fetchProperties');
      const properties = await residentFetchService.fetchPropertiesByAssociations(associationIds);
      performanceMonitor.endOperation(fetchPropertiesId);
      
      if (properties.length === 0) {
        console.log('No properties found for associations:', associationIds);
        setResidents([]);
        setLoading(false);
        performanceMonitor.endOperation(operationId);
        return;
      }
      
      // Get all property IDs
      const propertyIds = properties.map(p => p.id);
      
      // Fetch residents in batches
      const fetchResidentsId = performanceMonitor.startOperation('fetchResidents');
      const allResidents = await residentFetchService.fetchResidentsBatched(propertyIds);
      performanceMonitor.endOperation(fetchResidentsId);
      
      // Format the residents data
      const formatId = performanceMonitor.startOperation('formatResidents');
      const formattedResidents = residentFormatterService.formatResidentsData(
        allResidents, 
        properties, 
        associations
      );
      performanceMonitor.endOperation(formatId);
      
      // Cache the results
      residentCacheService.set(associationIds, formattedResidents);
      
      console.log(`Processed ${formattedResidents.length} residents`);
      setResidents(formattedResidents);
      
    } catch (error: any) {
      console.error('Error loading residents:', error);
      setError('Failed to load residents data: ' + (error?.message || 'Unknown error'));
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
      performanceMonitor.endOperation(operationId);
    }
  }, [associations]);

  const invalidateCache = useCallback((associationId?: string) => {
    residentCacheService.invalidate(associationId);
  }, []);

  return {
    residents,
    loading,
    error,
    associations,
    isLoadingAssociations: associationsQuery.isLoading,
    fetchResidentsByAssociationId,
    invalidateCache,
    setError
  };
};
