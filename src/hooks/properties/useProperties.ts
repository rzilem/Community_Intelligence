
import { useSupabaseQuery } from '@/hooks/supabase';
import { Property } from '@/types/app-types';

export function useProperties(associationId?: string) {
  const {
    data: properties = [],
    isLoading,
    error
  } = useSupabaseQuery<Property[]>({
    tableName: 'properties',
    select: '*',
    filters: associationId ? [{ column: 'association_id', value: associationId }] : [],
    orderBy: { column: 'address', ascending: true }
  },
  !!associationId
  );

  return {
    properties,
    isLoading,
    error
  };
}
