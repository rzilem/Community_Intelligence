
import { useSupabaseQuery } from '@/hooks/supabase';
import { DocumentCategory, UseCategoriesParams } from '@/types/document-types';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export function useDocumentCategories({ associationId, enabled = true }: UseCategoriesParams = {}) {
  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<DocumentCategory[]>(
    'document_categories',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
      order: { column: 'name', ascending: true }
    },
    enabled && !!associationId
  );

  useEffect(() => {
    if (error) {
      // Type guard to check if error has a code property (PostgrestError)
      if ('code' in error && error.code === '42P01' && !localStorage.getItem('document_categories_error_shown')) {
        toast.error('Document categories functionality is not fully available yet');
        localStorage.setItem('document_categories_error_shown', 'true');
        
        // Clear the error message after 1 hour to allow retrying
        setTimeout(() => {
          localStorage.removeItem('document_categories_error_shown');
        }, 60 * 60 * 1000);
      } else if (!('code' in error) || error.code !== '42P01') {
        toast.error('Failed to load document categories');
      }
      console.error('Error loading document categories:', error);
    }
  }, [error]);

  return {
    categories: categories || [],
    isLoading,
    error,
    refetch
  };
}
