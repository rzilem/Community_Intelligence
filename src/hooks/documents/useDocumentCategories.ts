
import { useSupabaseQuery } from '@/hooks/supabase';
import { DocumentCategory } from '@/types/document-types';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useDocumentCategories(associationId?: string) {
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
    !!associationId
  );

  useEffect(() => {
    if (error) {
      toast.error('Failed to load document categories');
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
