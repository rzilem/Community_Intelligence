
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export function useDocumentViewer(invoiceId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching PDF URL for invoice: ${invoiceId}`);
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('pdf_url, source_document')
          .eq('id', invoiceId)
          .single();

        if (fetchError) throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
        if (!invoice) throw new Error('Invoice not found');
        if (!invoice.pdf_url) throw new Error('No PDF URL found');

        console.log(`Retrieved PDF URL: ${invoice.pdf_url}`);
        console.log(`Source document: ${invoice.source_document || 'none'}`);

        // Always generate a fresh signed URL to avoid expiry issues
        try {
          // Extract the path from the PDF URL
          let storagePath;
          if (invoice.pdf_url.includes('/storage/v1/object/public/invoices/')) {
            // Extract path from public URL
            storagePath = invoice.pdf_url.split('/invoices/').pop();
          } else if (invoice.pdf_url.includes('/storage/v1/object/sign/invoices/')) {
            // Extract path from signed URL (before token)
            storagePath = invoice.pdf_url.split('/invoices/').pop()?.split('?')[0];
          } else {
            // Assume it's a direct path
            storagePath = invoice.pdf_url;
          }

          console.log(`Extracted storage path: ${storagePath}`);

          // Generate a fresh signed URL
          const { data: signedData, error: signedError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(storagePath, 3600); // 1 hour expiry

          if (signedError) {
            console.error("Failed to generate signed URL:", signedError);
            // Fall back to the original URL
            setPdfUrl(invoice.pdf_url);
          } else {
            console.log(`Generated fresh signed URL: ${signedData.signedUrl}`);
            setPdfUrl(signedData.signedUrl);
          }
        } catch (signError) {
          console.error("Error refreshing signed URL:", signError);
          // Fall back to the original URL
          setPdfUrl(invoice.pdf_url);
        }
      } catch (err) {
        console.error("useDocumentViewer error:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId) {
      fetchPdfUrl();
    }
  }, [invoiceId]);

  return { pdfUrl, loading, error };
}
