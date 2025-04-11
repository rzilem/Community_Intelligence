
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/types/document-types';
import { ResaleDocumentLink } from '@/types/resale-types';
import { toast } from 'sonner';
import { fetchResaleDocumentLinks, updateResaleDocumentLinks } from '@/services/resale/resale-document-service';

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
      return fetchResaleDocumentLinks(packageId);
    },
    enabled: !!packageId
  });

  // Create or update document links
  const updateLinks = useMutation({
    mutationFn: async (links: { documentId: string; isIncluded: boolean }[]) => {
      if (!packageId) throw new Error("No package ID provided");
      await updateResaleDocumentLinks(packageId, links);
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
