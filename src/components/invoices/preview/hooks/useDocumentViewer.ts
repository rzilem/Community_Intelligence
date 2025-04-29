import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/**
 * Custom hook to fetch and manage a PDF URL for an invoice.
 * @param invoiceId - The ID of the invoice to fetch the PDF for.
 * @returns An object containing the PDF URL, loading state, and any errors.
 */
export function useDocumentViewer(invoiceId: string) {
  // State to hold the PDF URL, loading status, and error messages
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch the PDF URL when invoiceId changes
  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        // Reset states at the start of the fetch
        setLoading(true);
        setError(null);

        // Fetch invoice data from Supabase 'invoices' table
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('pdf_url, source_document')
          .eq('id', invoiceId)
          .single();

        // Handle fetch errors or missing data
        if (fetchError) throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
        if (!invoice) throw new Error('Invoice not found');
        if (!invoice.pdf_url) throw new Error('No PDF URL found');

        let finalUrl = invoice.pdf_url;

        // Check if the URL is not a signed URL (lacks 'token=') and generate one if needed
        if (!finalUrl.includes('token=')) {
          // Use source_document or extract filename from URL
          const filename = invoice.source_document || finalUrl.split('/').pop();
          const { data: signedData, error: signedError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(filename, 3600); // Signed URL valid for 1 hour

          if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
          finalUrl = signedData.signedUrl;
        }

        // Verify the URL is accessible with a HEAD request
        const response = await fetch(finalUrl, { method: 'HEAD' });
        if (!response.ok) throw new Error(`PDF URL inaccessible: ${response.statusText}`);

        // Set the verified URL in state
        setPdfUrl(finalUrl);
      } catch (err) {
        // Capture and set any errors
        setError(err.message);
      } finally {
        // Ensure loading is turned off after the operation
        setLoading(false);
      }
    }

    // Run the fetch if an invoiceId is provided
    if (invoiceId) fetchPdfUrl();
  }, [invoiceId]);

  // Return the current state for use in components
  return { pdfUrl, loading, error };
}
