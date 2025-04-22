
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentVersion } from '@/types/document-versioning-types';
import { useSupabaseQuery } from '@/hooks/supabase';

export function useDocumentVersions(documentId: string) {
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: versions = [],
    isLoading,
    refetch
  } = useSupabaseQuery<DocumentVersion[]>({
    tableName: 'document_versions',
    select: '*',
    filters: [{ column: 'document_id', value: documentId }],
    orderBy: { column: 'version_number', ascending: false }
  },
  !!documentId
  );

  const addVersion = async (file: File, notes?: string) => {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    setIsUploading(true);
    try {
      // Get the current max version number
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const nextVersionNumber = versionData ? versionData.version_number + 1 : 1;

      // Upload the file to storage
      const filePath = `documents/${documentId}/v${nextVersionNumber}/${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create version record
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersionNumber,
          url: publicUrlData.publicUrl,
          file_size: file.size,
          notes,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;

      // Update the document's current version
      await supabase
        .from('documents')
        .update({ current_version: nextVersionNumber, url: publicUrlData.publicUrl })
        .eq('id', documentId);

      return data;
    } catch (error) {
      console.error('Error adding document version:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    versions,
    isLoading,
    isUploading,
    addVersion,
    refetchVersions: refetch
  };
}
