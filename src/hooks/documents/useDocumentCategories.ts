
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { DocumentCategory, UseCategoriesParams } from '@/types/document-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDocumentCategories({ associationId, enabled = true }: UseCategoriesParams) {
  const [isCreating, setIsCreating] = useState(false);

  const { 
    data: categories, 
    isLoading, 
    refetch 
  } = useSupabaseQuery<DocumentCategory[]>(
    'document_categories',
    {
      select: '*',
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'name', ascending: true }
    },
    enabled && !!associationId
  );

  const createCategory = async (name: string) => {
    if (!associationId) {
      toast.error('No association selected');
      return null;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .insert({ 
          name, 
          association_id: associationId 
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Category created successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('document_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Category deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      return false;
    }
  };

  return {
    categories: categories || [],
    isLoading,
    isCreating,
    createCategory,
    deleteCategory,
    refetchCategories: refetch
  };
}
