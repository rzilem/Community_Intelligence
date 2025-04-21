
import { useState, useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { Property } from '@/types/property-types';

export const usePropertySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: properties, isLoading } = useSupabaseQuery<Property[]>(
    'properties',
    {
      select: 'id, address, unit_number, city, state, zip, association_id',
      filter: [
        {
          column: 'address',
          operator: 'ilike',
          value: searchTerm ? `%${searchTerm}%` : undefined
        }
      ],
      limit: 10,
      order: { column: 'address', ascending: true }
    },
    !!searchTerm
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    properties: properties || [],
    isLoading,
    handleSearch
  };
};
