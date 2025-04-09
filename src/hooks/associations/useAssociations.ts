
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
  
  // Get all associations with better error handling
  const { 
    data: associations = [], 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['associations', retryCount],
    queryFn: async () => {
      try {
        const data = await fetchAllAssociations();
        if (data.length === 0) {
          // If data is empty, try to check if we can retrieve data through RPC as a fallback
          try {
            console.log('Trying fallback method to fetch associations...');
            // Type assertion to handle RPC call
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'get_user_associations' as any
            );
            
            if (rpcError) {
              console.error('Fallback RPC error:', rpcError);
              return data; // Return original empty array if RPC also fails
            }
            
            if (Array.isArray(rpcData)) {
              console.log('Fallback method successful, retrieved:', rpcData.length || 0, 'associations');
              return rpcData || [];
            }
            
            return data; // Return original data if RPC result is not an array
          } catch (rpcEx) {
            console.error('Exception in fallback method:', rpcEx);
            return data; // Return original empty array on any exception
          }
        }
        return data;
      } catch (error) {
        console.error('Error in associations query:', error);
        throw error;
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
  
  // Create a new association
  const createMutation = useMutation({
    mutationFn: createAssociation,
    onSuccess: (newAssociation) => {
      if (newAssociation) {
        toast.success(`Association "${newAssociation.name}" created successfully`);
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
