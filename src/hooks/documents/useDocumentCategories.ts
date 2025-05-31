
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DocumentCategory, UseCategoriesParams } from '@/types/document-types';
import { toast } from 'sonner';

export function useDocumentCategories({ associationId, enabled = true }: UseCategoriesParams = {}) {
  return useQuery({
    queryKey: ['document-categories', associationId],
    queryFn: async () => {
      if (!associationId) return [];
      
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .eq('association_id', associationId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }

      return (data || []) as DocumentCategory[];
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
      const { data, error } = await supabase
        .from('document_categories')
        .insert({
          name,
          association_id: associationId,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentCategory;
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
      const { data, error } = await supabase
        .from('document_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentCategory;
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
      const { error } = await supabase
        .from('document_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
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
