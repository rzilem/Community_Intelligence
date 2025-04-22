
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Document, UseDocumentsParams } from '@/types/document-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDocuments({ associationId, category = null, enabled = true }: UseDocumentsParams) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Build filters based on inputs
  const filters = [
    { column: 'association_id', value: associationId }
  ];
  
  if (category) {
    filters.push({ column: 'category', value: category });
  }

  const { 
    data: documents, 
    isLoading, 
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

  const uploadDocument = async (file: File, categoryId: string, description: string) => {
    if (!file || !associationId) {
      toast.error('Missing required fields');
      return null;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${associationId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          url: publicUrl,
          file_type: fileExt || 'unknown',
          file_size: file.size,
          description,
          category: categoryId,
          association_id: associationId,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'system' // In a real app, this would be the current user ID
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Document uploaded successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document details to find the file path
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      
      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      // Try to delete from storage if we have a URL
      if (doc?.url) {
        try {
          // Extract path from URL
          const url = new URL(doc.url);
          const pathParts = url.pathname.split('/');
          const storagePathIndex = pathParts.findIndex(part => part === 'documents');
          
          if (storagePathIndex >= 0) {
            const storagePath = pathParts.slice(storagePathIndex + 1).join('/');
            await supabase.storage
              .from('documents')
              .remove([storagePath]);
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue anyway since the DB record is deleted
        }
      }
      
      toast.success('Document deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  };

  return {
    documents: documents || [],
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    refetchDocuments: refetch
  };
}
