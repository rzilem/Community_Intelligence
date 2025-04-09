
import { useState } from 'react';
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
  
  // Get all associations
  const { data: associations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['associations'],
    queryFn: fetchAllAssociations
  });
  
  // Create a new association
  const createMutation = useMutation({
    mutationFn: createAssociation,
    onSuccess: (newAssociation) => {
      if (newAssociation) {
        toast.success('Association created successfully');
        queryClient.invalidateQueries({ queryKey: ['associations'] });
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
  
  return {
    associations,
    isLoading,
    error,
    refetch,
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
