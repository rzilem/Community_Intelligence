import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-types';
import { useAuth } from '@/contexts/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDocumentOperations() {
  const { user, currentAssociation } = useAuth();
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
      const filePath = `${associationId}/${user.id}/${Date.now()}_${file.name}`;
      
      console.log("Starting upload to storage path:", filePath);
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw new Error(`Error uploading file: ${storageError.message}`);
      }
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      console.log("File uploaded successfully, getting public URL:", urlData.publicUrl);
      
      // Create document record in database
      const documentData = {
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
        created_at: new Date().toISOString(), // Use created_at instead of uploaded_at to match the database
      };
      
      console.log("Creating database record with data:", {
        name: documentData.name,
        association_id: documentData.association_id,
        uploaded_by: documentData.uploaded_by
      });
      
      // Insert the document into the database
      const { data, error: docError } = await supabase
        .from("documents")
        .insert(documentData)
        .select()
        .single();
      
      if (docError) {
        console.error("Database insert error:", docError);
        
        // If database insert fails, try to clean up the uploaded file
        try {
          await supabase.storage.from('documents').remove([filePath]);
          console.log("Cleaned up storage file after failed database insert");
        } catch (cleanupError) {
          console.error("Failed to clean up storage file:", cleanupError);
        }
        
        if (docError.message.includes('violates row level security policy')) {
          throw new Error(`Security policy error: You don't have permission to upload documents to this association. Please check your role and association access.`);
        }
        
        throw new Error(`Database error: ${docError.message}`);
      }
      
      console.log("Document record created successfully:", data.id);
      
      // Map the database response to our Document type
      // This ensures we're using the correct property names and providing fallbacks
      const document: Document = {
        id: data.id,
        association_id: data.association_id,
        name: data.name,
        url: data.url,
        file_type: data.file_type,
        file_size: data.file_size,
        description: data.description,
        category: data.category,
        tags: data.tags,
        is_public: data.is_public,
        is_archived: data.is_archived,
        uploaded_by: data.uploaded_by,
        // Use created_at field from the database as uploaded_at in our Document type
        uploaded_at: data.created_at,
        // Add default values for fields that might not be present in the database
        last_accessed: null,
        current_version: data.current_version || 1
      };
      
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
        .from("documents")
        .delete()
        .eq("id", document.id);
        
      if (docError) {
        if (docError.message.includes('violates row level security policy')) {
          throw new Error(`Security error: You don't have permission to delete this document.`);
        }
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
        if (error.message.includes('violates row level security policy')) {
          throw new Error(`Security error: You don't have permission to create categories in this association.`);
        }
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
