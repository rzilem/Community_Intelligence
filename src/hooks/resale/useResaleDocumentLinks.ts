
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/types/document-types';
import { ResaleDocumentLink } from '@/types/resale-types';
import { toast } from 'sonner';

export const useResaleDocumentLinks = (packageId?: string) => {
  const queryClient = useQueryClient();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  // Fetch linked documents for a resale package
  const {
    data: linkedDocuments = [],
    isLoading: isLoadingLinks,
    error: linksError,
    refetch: refetchLinks
  } = useQuery({
    queryKey: ['resale-document-links', packageId],
    queryFn: async (): Promise<ResaleDocumentLink[]> => {
      if (!packageId) return [];

      // This is a mock implementation - in a real app, you would fetch from Supabase
      // The actual implementation would join the documents table to get document details
      const { data, error } = await supabase
        .from('resale_document_links')
        .select(`
          *,
          document:documents(*)
        `)
        .eq('resale_package_id', packageId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!packageId
  });

  // Create or update document links
  const updateLinks = useMutation({
    mutationFn: async (links: { documentId: string; isIncluded: boolean }[]) => {
      if (!packageId) throw new Error("No package ID provided");

      // This would be implemented with Supabase upsert in a real app
      // Mock implementation for now
      for (const link of links) {
        // Check if link already exists
        const { data: existingLink } = await supabase
          .from('resale_document_links')
          .select('*')
          .eq('resale_package_id', packageId)
          .eq('document_id', link.documentId)
          .single();

        if (existingLink) {
          // Update existing link
          await supabase
            .from('resale_document_links')
            .update({ is_included: link.isIncluded })
            .eq('id', existingLink.id);
        } else {
          // Create new link
          await supabase
            .from('resale_document_links')
            .insert({
              resale_package_id: packageId,
              document_id: link.documentId,
              is_included: link.isIncluded,
              document_type: 'other', // Default type
              is_required: false
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resale-document-links', packageId] });
      toast.success('Document links updated successfully');
    },
    onError: (error) => {
      console.error('Error updating document links:', error);
      toast.error('Failed to update document links');
    }
  });

  // Helper functions for dialog
  const openLinkDialog = () => setIsLinkDialogOpen(true);
  const closeLinkDialog = () => setIsLinkDialogOpen(false);

  return {
    linkedDocuments,
    isLoadingLinks,
    linksError,
    updateLinks,
    isLinkDialogOpen,
    openLinkDialog,
    closeLinkDialog,
    refetchLinks
  };
};
