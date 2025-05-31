
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DocumentCategory, UseCategoriesParams } from '@/types/document-types';
import { toast } from 'sonner';

// Mock data for now since document_categories table doesn't exist yet
const mockCategories: DocumentCategory[] = [
  { id: '1', name: 'Legal Documents', association_id: 'demo-association-id' },
  { id: '2', name: 'Financial Reports', association_id: 'demo-association-id' },
  { id: '3', name: 'Maintenance Records', association_id: 'demo-association-id' },
  { id: '4', name: 'Board Minutes', association_id: 'demo-association-id' },
];

export function useDocumentCategories({ associationId, enabled = true }: UseCategoriesParams = {}) {
  return useQuery({
    queryKey: ['document-categories', associationId],
    queryFn: async () => {
      if (!associationId) return [];
      
      // Return mock data for now
      return mockCategories.filter(cat => cat.association_id === associationId);
    },
    enabled: enabled && !!associationId,
  });
}

export function useCreateDocumentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, associationId, description }: {
      name: string;
      associationId: string;
      description?: string;
    }) => {
      // Mock implementation for now
      const newCategory: DocumentCategory = {
        id: Date.now().toString(),
        name,
        association_id: associationId,
        created_at: new Date().toISOString(),
      };
      
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    },
  });
}

export function useUpdateDocumentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: Partial<DocumentCategory>;
    }) => {
      // Mock implementation for now
      const updatedCategory: DocumentCategory = {
        id,
        name: updates.name || 'Updated Category',
        association_id: updates.association_id || 'demo-association-id',
        updated_at: new Date().toISOString(),
      };
      
      return updatedCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    },
  });
}

export function useDeleteDocumentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation for now
      console.log('Deleting category:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    },
  });
}
