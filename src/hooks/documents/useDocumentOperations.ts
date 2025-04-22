
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-types';
import { toast } from 'sonner';

export function useDocumentOperations() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const downloadDocument = async (document: Document) => {
    if (!document.url) {
      toast.error('Document URL not available');
      return;
    }

    setIsDownloading(true);
    try {
      // For documents in Supabase Storage, we can try to get the file directly
      if (document.url.includes('/storage/v1/object/public/')) {
        // Extract path from URL
        const url = new URL(document.url);
        const pathParts = url.pathname.split('/');
        const storagePathIndex = pathParts.findIndex(part => part === 'documents');
        
        if (storagePathIndex >= 0) {
          const storagePath = pathParts.slice(storagePathIndex + 1).join('/');
          
          const { data, error } = await supabase.storage
            .from('documents')
            .download(storagePath);
            
          if (error) throw error;
          
          // Create a download link
          const blob = new Blob([data], { type: `application/${document.file_type}` });
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = document.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          
          toast.success('Document downloaded successfully');
          return;
        }
      }
      
      // Fallback to direct download if not in storage
      window.open(document.url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  const viewDocument = async (document: Document) => {
    if (!document.url) {
      toast.error('Document URL not available');
      return;
    }

    setIsViewing(true);
    try {
      window.open(document.url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    } finally {
      setIsViewing(false);
    }
  };

  return {
    isDownloading,
    isViewing,
    downloadDocument,
    viewDocument
  };
}
