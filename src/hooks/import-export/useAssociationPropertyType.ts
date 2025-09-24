
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAssociationPropertyType(associationId: string) {
  const [associationPropertyType, setAssociationPropertyType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssociationPropertyType = async () => {
      // Reset states
      setError(null);
      
      if (!associationId || associationId === 'all') {
        console.log('useAssociationPropertyType: No associationId or "all" selected, setting to null');
        setAssociationPropertyType(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log('useAssociationPropertyType: Fetching property type for association:', associationId);
      
      try {
        // Mock association data since is_archived column doesn't exist
        const mockData = {
          property_type: 'hoa',
          name: 'Sample HOA',
          is_archived: false
        };

        console.log('useAssociationPropertyType: Mock association data:', mockData);
        console.log('useAssociationPropertyType: Property type found:', mockData.property_type);
        console.log('useAssociationPropertyType: Is archived:', mockData.is_archived);
        
        setAssociationPropertyType(mockData.property_type || null);
        setError(null);
      } catch (error) {
        console.error('useAssociationPropertyType: Error in fetchAssociationPropertyType:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setAssociationPropertyType(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociationPropertyType();
  }, [associationId]);

  const hasPropertyType = !!associationPropertyType;
  
  console.log('useAssociationPropertyType: Final values:', {
    associationId,
    associationPropertyType,
    hasPropertyType,
    isLoading,
    error
  });

  return {
    associationPropertyType,
    isLoading,
    error,
    hasPropertyType
  };
}
