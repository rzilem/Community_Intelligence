
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  url: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  file_size: number;
}

export function useDocumentVersions(documentId: string) {
  const [isUploading, setIsUploading] = useState(false);

  const { 
    data: versions, 
    isLoading, 
    refetch 
  } = useSupabaseQuery<DocumentVersion[]>(
    'document_versions',
    {
      select: '*',
      filter: [{ column: 'document_id', value: documentId }],
      order: { column: 'version_number', ascending: false }
    },
    !!documentId
  );

  const addVersion = async (file: File, notes?: string) => {
    if (!file || !documentId) {
      toast.error('Missing required fields');
      return null;
    }

    setIsUploading(true);
    try {
      // Get current document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;
      
      // Get latest version number
      const latestVersion = document.current_version || 1;
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentId}_v${latestVersion + 1}.${fileExt}`;
      const filePath = `${document.association_id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Create version record
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: latestVersion + 1,
          url: publicUrl,
          notes,
          file_size: file.size,
          created_by: 'system' // In a real app, this would be the current user ID
        })
        .select()
        .single();

      if (versionError) throw versionError;
      
      // Update document record with new current version
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          current_version: latestVersion + 1,
          url: publicUrl, // Update the main document to point to the latest version
          file_size: file.size,
          file_type: fileExt || document.file_type
        })
        .eq('id', documentId);

      if (updateError) throw updateError;
      
      toast.success('New version uploaded successfully');
      refetch();
      return versionData;
    } catch (error) {
      console.error('Error adding document version:', error);
      toast.error('Failed to add new version');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    versions: versions || [],
    isLoading,
    isUploading,
    addVersion,
    refetchVersions: refetch
  };
}
