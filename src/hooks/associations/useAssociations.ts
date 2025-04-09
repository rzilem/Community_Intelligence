
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
    queryFn: fetchAllAssociations,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching associations:', error);
        toast.error('Failed to load associations. Please try refreshing.');
      }
    }
  });
  
  // Auto-retry if we get back an empty list but there should be data
  useEffect(() => {
    if (!isLoading && associations.length === 0 && retryCount < 3 && !error) {
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
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['associations'] });
        
        // Manually update the cache to immediately show the new association
        queryClient.setQueryData(['associations'], (oldData: Association[] = []) => {
          return [...oldData, newAssociation];
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
    toast.info('Refreshing associations...');
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
