
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllAssociations, fetchAssociationById } from '@/services/association-service';
import { supabase } from '@/integrations/supabase/client';
import { Association } from '@/types/association-types';

/**
 * Fetches associations via user memberships as a fallback method
 */
export const fetchAssociationsViaUserMemberships = async (): Promise<Association[]> => {
  try {
    console.log('Trying to fetch associations via user memberships...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    // Call our security definer RPC function
    const { data, error } = await supabase.rpc('get_user_associations');
    
    if (error) {
      console.error('Error fetching user associations:', error);
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} associations via memberships`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAssociationsViaUserMemberships:', error);
    return [];
  }
};

/**
 * Custom hook to fetch all associations
 */
export const useAssociationsList = () => {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    data: associations = [], 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['associations', retryCount],
    queryFn: async () => {
      try {
        console.log('Fetching associations, attempt:', retryCount + 1);
        return await fetchAllAssociations();
      } catch (error) {
        console.error('Error in associations query:', error);
        
        // On error, try the fallback method
        console.log('Error in main query, trying fallback...');
        try {
          return await fetchAssociationsViaUserMemberships();
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw error; // Re-throw the original error if fallback also fails
        }
      }
    },
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });
  
  // Auto-retry if we get back an empty list but there should be data
  useEffect(() => {
    if (!isLoading && Array.isArray(associations) && associations.length === 0 && retryCount < 3 && !error) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying association fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [associations, isLoading, retryCount, error]);
  
  const manuallyRefresh = () => {
    console.log('Manually refreshing associations...');
    queryClient.invalidateQueries({ queryKey: ['associations'] });
    setRetryCount(prev => prev + 1);
  };
  
  return { associations, isLoading, error, refetch, manuallyRefresh, retryCount };
};

/**
 * Custom hook to fetch a single association by ID
 */
export const useAssociationById = (id: string) => {
  return useQuery({
    queryKey: ['association', id],
    queryFn: () => fetchAssociationById(id),
    enabled: !!id
  });
};
