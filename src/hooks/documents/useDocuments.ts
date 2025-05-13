
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
    data: documentsRaw,
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<any[]>(
    'documents',
    {
      select: '*',
      filter: filters,
      order: { column: 'created_at', ascending: false } // Use created_at for ordering
    },
    enabled && !!associationId
  );

  // Transform the raw documents to match our Document type
  const documents: Document[] = documentsRaw?.map(doc => ({
    id: doc.id,
    association_id: doc.association_id,
    name: doc.name,
    url: doc.url,
    file_type: doc.file_type,
    file_size: doc.file_size,
    description: doc.description,
    category: doc.category,
    tags: doc.tags,
    is_public: doc.is_public,
    is_archived: doc.is_archived,
    uploaded_by: doc.uploaded_by,
    uploaded_at: doc.created_at, // Map created_at to uploaded_at
    last_accessed: null, // Default to null
    current_version: doc.current_version || 1
  })) || [];

  useEffect(() => {
    if (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    }
  }, [error]);

  return {
    documents,
    isLoading,
    error,
    refetch
  };
}
