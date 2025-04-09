
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchAllAssociations, 
  fetchAssociationById, 
  createAssociation, 
  updateAssociation, 
  deleteAssociation 
} from '@/services/association-service';
import { Association } from '@/types/association-types';
import { supabase } from '@/integrations/supabase/client';

export const useAssociations = () => {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  
  // Get all associations with better error handling and fallback mechanisms
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
  
  // Helper function to fetch associations via user memberships
  const fetchAssociationsViaUserMemberships = async () => {
    try {
      console.log('Trying to fetch associations via user memberships...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }
      
      // First get the association IDs the user is a member of
      const { data: userAssociations, error: membershipError } = await supabase
        .from('association_users')
        .select('association_id')
        .eq('user_id', user.id);
      
      if (membershipError) {
        console.error('Error fetching user association memberships:', membershipError);
        return [];
      }
      
      if (!userAssociations || userAssociations.length === 0) {
        console.log('User is not a member of any associations');
        return [];
      }
      
      console.log(`User is a member of ${userAssociations.length} associations`);
      const associationIds = userAssociations.map(ua => ua.association_id);
      
      // Then fetch the actual associations by those IDs
      const { data: associationsData, error: associationsError } = await supabase
        .from('associations')
        .select('*')
        .in('id', associationIds);
      
      if (associationsError) {
        console.error('Error fetching associations by IDs:', associationsError);
        return [];
      }
      
      console.log(`Successfully fetched ${associationsData?.length || 0} associations via memberships`);
      return associationsData || [];
    } catch (error) {
      console.error('Error in fetchAssociationsViaUserMemberships:', error);
      return [];
    }
  };
  
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
  
  // Create a new association
  const createMutation = useMutation({
    mutationFn: createAssociation,
    onSuccess: (newAssociation) => {
      if (newAssociation) {
        // No need for a toast here as the service already shows one
        
        // Force refetch to ensure we get the latest data
        queryClient.invalidateQueries({ queryKey: ['associations'] });
        setRetryCount(prev => prev + 1);
        
        // Also add it directly to the cache to ensure UI updates immediately
        queryClient.setQueryData(['associations', retryCount], (oldData: Association[] | undefined) => {
          const existingData = oldData || [];
          return [...existingData, newAssociation];
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create association: ${error.message}`);
    }
  });
  
  // Update an association
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Association> }) => 
      updateAssociation(id, data),
    onSuccess: (updatedAssociation) => {
      if (updatedAssociation) {
        toast.success('Association updated successfully');
        queryClient.invalidateQueries({ queryKey: ['associations'] });
        queryClient.invalidateQueries({ 
          queryKey: ['association', updatedAssociation.id] 
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update association: ${error.message}`);
    }
  });
  
  // Delete an association
  const deleteMutation = useMutation({
    mutationFn: deleteAssociation,
    onSuccess: (success, id) => {
      if (success) {
        toast.success('Association deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['associations'] });
        queryClient.removeQueries({ queryKey: ['association', id] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete association: ${error.message}`);
    }
  });
  
  // Get association by ID (for detail pages)
  const getAssociationById = (id: string) => {
    return useQuery({
      queryKey: ['association', id],
      queryFn: () => fetchAssociationById(id),
      enabled: !!id
    });
  };
  
  const manuallyRefresh = () => {
    console.log('Manually refreshing associations...');
    queryClient.invalidateQueries({ queryKey: ['associations'] });
    setRetryCount(prev => prev + 1);
  };
  
  return {
    associations,
    isLoading,
    error,
    refetch,
    manuallyRefresh,
    createAssociation: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAssociation: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteAssociation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    getAssociationById
  };
};

export default useAssociations;
