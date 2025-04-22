
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DocumentVersion, DocumentWithVersions } from '@/types/document-versioning-types';
import { toast } from 'sonner';

export const useDocumentVersions = (documentId?: string) => {
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);

  const { 
    data: versions, 
    isLoading: versionsLoading,
    refetch: refetchVersions
  } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      
      try {
        // Use a more type-safe approach to query document versions
        const { data, error } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false });
          
        if (error) throw error;
        
        // Return the data as DocumentVersion[]
        return (data || []) as DocumentVersion[];
      } catch (error: any) {
        console.error('Error fetching document versions:', error);
        toast.error(`Error loading versions: ${error.message}`);
        return [];
      }
    },
    enabled: !!documentId
  });

  const uploadNewVersion = async (file: File, documentId: string, notes?: string) => {
    setIsUploadingVersion(true);
    try {
      // Get the current document to determine next version number
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('current_version')
        .eq('id', documentId)
        .single();
        
      if (docError) throw docError;
      
      // Safely handle the current_version
      const currentVersion = document && typeof document.current_version === 'number' 
        ? document.current_version 
        : 0;
      
      const nextVersion = currentVersion + 1;
      
      // Upload file to storage
      const fileName = `${documentId}/v${nextVersion}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
        
      const fileUrl = urlData.publicUrl;
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create version record
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersion,
          url: fileUrl,
          file_size: file.size,
          created_by: user.id,
          notes: notes || `Version ${nextVersion}`
        });
        
      if (versionError) throw versionError;
      
      // Update document with new version info
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          url: fileUrl,
          file_size: file.size,
          current_version: nextVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
        
      if (updateError) throw updateError;
      
      await refetchVersions();
      toast.success(`Version ${nextVersion} uploaded successfully`);
      return true;
    } catch (error: any) {
      console.error('Error uploading new version:', error);
      toast.error(`Error uploading new version: ${error.message}`);
      return false;
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const uploadVersionMutation = useMutation({
    mutationFn: ({ 
      file, 
      documentId, 
      notes 
    }: { 
      file: File; 
      documentId: string; 
      notes?: string 
    }) => uploadNewVersion(file, documentId, notes)
  });

  const revertToVersion = async (documentId: string, versionId: string, versionNumber: number) => {
    try {
      // Get version details
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('url, file_size')
        .eq('id', versionId)
        .single();
        
      if (versionError) throw versionError;
      
      // Ensure we have valid data before proceeding
      if (!version || !version.url || typeof version.file_size !== 'number') {
        throw new Error('Invalid version data');
      }
      
      // Update document with version info
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          url: version.url,
          file_size: version.file_size,
          current_version: versionNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
        
      if (updateError) throw updateError;
      
      toast.success(`Reverted to version ${versionNumber}`);
      return true;
    } catch (error: any) {
      console.error('Error reverting to version:', error);
      toast.error(`Error reverting to version: ${error.message}`);
      return false;
    }
  };

  const revertVersionMutation = useMutation({
    mutationFn: ({ 
      documentId, 
      versionId, 
      versionNumber 
    }: { 
      documentId: string; 
      versionId: string; 
      versionNumber: number 
    }) => revertToVersion(documentId, versionId, versionNumber)
  });

  return {
    versions: versions || [],
    versionsLoading,
    isUploadingVersion: isUploadingVersion || uploadVersionMutation.isPending,
    uploadNewVersion: uploadVersionMutation.mutate,
    revertToVersion: revertVersionMutation.mutate,
    refetchVersions
  };
};
