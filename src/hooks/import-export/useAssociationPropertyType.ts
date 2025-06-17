
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
        const { data, error } = await supabase
          .from('associations')
          .select('property_type, name, is_archived')
          .eq('id', associationId)
          .single();

        if (error) {
          console.error('useAssociationPropertyType: Error fetching association property type:', error);
          setError(error.message);
          setAssociationPropertyType(null);
        } else {
          console.log('useAssociationPropertyType: Association data:', data);
          console.log('useAssociationPropertyType: Property type found:', data?.property_type);
          console.log('useAssociationPropertyType: Is archived:', data?.is_archived);
          
          // Add additional logging for debugging the import issue
          if (data?.is_archived) {
            console.warn('useAssociationPropertyType: WARNING - Selected association is archived:', data.name);
          }
          
          setAssociationPropertyType(data?.property_type || null);
        }
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
