
import { useState, useEffect } from 'react';
import { fetchPropertiesByHOA } from '@/services/hoa/property-service';
import { Property } from '@/types/property-types';

export const usePropertyList = (associationId?: string) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      if (!associationId) {
        setProperties([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const propertiesList = await fetchPropertiesByHOA(associationId);
        setProperties(propertiesList);
      } catch (err: any) {
        console.error('Error loading properties:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [associationId]);

  return {
    properties,
    isLoading,
    error
  };
};
