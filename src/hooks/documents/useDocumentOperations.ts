
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-types';
import { useAuth } from '@/contexts/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDocumentOperations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      category, 
      description, 
      associationId 
    }: { 
      file: File;
      category?: string;
      description?: string;
      associationId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Create path for the file in the bucket
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (storageError) {
        throw new Error(`Error uploading file: ${storageError.message}`);
      }
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Create document record in database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_type: file.name.split('.').pop() || 'unknown',
          file_size: file.size,
          url: urlData.publicUrl,
          description,
          category: category || null,
          association_id: associationId,
          uploaded_by: user.id,
          is_public: false,
          is_archived: false,
          // Using uploaded_date as it's defined in the database schema
          uploaded_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (docError) {
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Error creating document record: ${docError.message}`);
      }
      
      // Map the database fields to match our Document type
      const document: Document = {
        ...docData,
        // Map uploaded_date to uploaded_at to satisfy the Document interface
        uploaded_at: docData.uploaded_date
      } as Document;
      
      return document;
    },
    
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    
    onError: (error) => {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Document upload error:', error);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: Document) => {
      if (!user) throw new Error('User not authenticated');
      
      // Extract the file path from the URL
      const url = new URL(document.url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
      
      if (!pathMatch || !pathMatch[1]) {
        throw new Error('Could not determine storage file path');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      
      // Delete document record from database
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
        
      if (docError) {
        throw new Error(`Error deleting document record: ${docError.message}`);
      }
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
        
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // We don't throw here as the database record is already deleted
      }
      
      return document;
    },
    
    onSuccess: (document) => {
      toast.success(`${document.name} has been deleted`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    
    onError: (error) => {
      toast.error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Document delete error:', error);
    }
  });

  const createCategory = useMutation({
    mutationFn: async ({ 
      name, 
      associationId 
    }: { 
      name: string;
      associationId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Use a type cast to bypass TypeScript's strict checking
      // This is necessary because document_categories isn't in the TypeScript definitions yet
      const { data, error } = await (supabase
        .from('document_categories' as any)
        .insert({
          name,
          association_id: associationId
        })
        .select()
        .single());
        
      if (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }
      
      return data;
    },
    
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['document_categories'] });
    },
    
    onError: (error) => {
      toast.error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Category creation error:', error);
    }
  });

  return {
    uploadDocument,
    deleteDocument,
    createCategory
  };
}
