
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAssociationPropertyType(associationId: string) {
  const [associationPropertyType, setAssociationPropertyType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAssociationPropertyType = async () => {
      if (!associationId || associationId === 'all') {
        setAssociationPropertyType(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('associations')
          .select('property_type')
          .eq('id', associationId)
          .single();

        if (error) {
          console.error('Error fetching association property type:', error);
          setAssociationPropertyType(null);
        } else {
          setAssociationPropertyType(data?.property_type || null);
        }
      } catch (error) {
        console.error('Error in fetchAssociationPropertyType:', error);
        setAssociationPropertyType(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociationPropertyType();
  }, [associationId]);

  return {
    associationPropertyType,
    isLoading,
    hasPropertyType: !!associationPropertyType
  };
}
