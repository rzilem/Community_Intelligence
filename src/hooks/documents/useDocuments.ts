
import { useSupabaseQuery } from '@/hooks/supabase';
import { Document, UseDocumentsParams } from '@/types/document-types';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useDocuments({ associationId, category, enabled = true }: UseDocumentsParams = {}) {
  const filters = [];
  
  if (associationId) {
    filters.push({ column: 'association_id', value: associationId });
  }
  
  if (category) {
    filters.push({ column: 'category', value: category });
  }

  const {
    data: documents,
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<Document[]>(
    'documents',
    {
      select: '*',
      filter: filters,
      order: { column: 'uploaded_at', ascending: false }
    },
    enabled && !!associationId
  );

  useEffect(() => {
    if (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    }
  }, [error]);

  return {
    documents: documents || [],
    isLoading,
    error,
    refetch
  };
}
