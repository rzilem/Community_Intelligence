
import { useState, useEffect } from 'react';
import { propertyService } from '@/services/properties/property-service';
import { PropertyUI } from '@/types/property-types';
import { toast } from 'sonner';

export function useProperties(associationId?: string) {
  const [properties, setProperties] = useState<PropertyUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!associationId) {
      setProperties([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await propertyService.getPropertiesByAssociation(associationId);
      setProperties(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(errorMessage);
      toast.error('Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchProperties = async (searchTerm: string) => {
    if (!associationId) return;

    setIsLoading(true);
    try {
      if (searchTerm.trim()) {
        const data = await propertyService.searchProperties(associationId, searchTerm);
        setProperties(data);
      } else {
        await fetchProperties();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search properties';
      setError(errorMessage);
      toast.error('Failed to search properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [associationId]);

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    searchProperties,
    refetch: fetchProperties
  };
}
