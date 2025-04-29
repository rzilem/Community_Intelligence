
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const handleIframeError = () => {
    console.error('PDF iframe failed to load');
    setIframeError(true);
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    setIframeError(false);
    try {
      // Re-fetch the URL when retrying
      await fetchPdfUrl();
    } catch (err) {
      console.error('Retry failed:', err);
      setError('Failed to refresh PDF link');
      setLoading(false);
    }
  };

  // Effect to fetch the PDF URL when invoiceId changes
  useEffect(() => {
    if (invoiceId) fetchPdfUrl();
  }, [invoiceId]);

  // Function to fetch PDF URL
  async function fetchPdfUrl() {
    try {
      // Reset states at the start of the fetch
      setLoading(true);
      setError(null);
      setIframeError(false);

      // If invoiceId is actually a filename, use it directly
      if (invoiceId.includes('.pdf')) {
        console.log('Using direct filename:', invoiceId);
        try {
          // Create a signed URL for the file
          const { data: signedData, error: signedError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(invoiceId, 3600); // Signed URL valid for 1 hour

          if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
          
          // Store the original URL for reference
          setOriginalUrl(invoiceId);
          setProxyUrl(signedData.signedUrl);
          setPdfUrl(signedData.signedUrl);
          setLoading(false);
          return;
        } catch (directError) {
          console.error('Error treating invoiceId as filename:', directError);
          // Continue to try fetching as an invoice ID
        }
      }

      // Fetch invoice data from Supabase 'invoices' table
      console.log('Fetching invoice data for ID:', invoiceId);
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('pdf_url, source_document')
        .eq('id', invoiceId)
        .single();

      // Handle fetch errors or missing data
      if (fetchError) throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
      if (!invoice) throw new Error('Invoice not found');
      if (!invoice.pdf_url) throw new Error('No PDF URL found');

      console.log('Found invoice with pdf_url:', invoice.pdf_url);
      
      // Store the original URL for reference
      setOriginalUrl(invoice.pdf_url);
      let finalUrl = invoice.pdf_url;

      // Check if the URL is not a signed URL (lacks 'token=') and generate one if needed
      if (!finalUrl.includes('token=')) {
        // Use source_document or extract filename from URL
        const filename = invoice.source_document || finalUrl.split('/').pop();
        
        if (!filename) {
          throw new Error('Could not determine filename for signed URL');
        }
        
        console.log('Generating signed URL for:', filename);
        const { data: signedData, error: signedError } = await supabase.storage
          .from('invoices')
          .createSignedUrl(filename, 3600); // Signed URL valid for 1 hour

        if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
        finalUrl = signedData.signedUrl;
        setProxyUrl(finalUrl);
      }

      console.log('Final PDF URL:', finalUrl);
      
      // Set the verified URL in state
      setPdfUrl(finalUrl);
    } catch (err: any) {
      // Capture and set any errors
      console.error('Error in fetchPdfUrl:', err);
      setError(err.message || 'Failed to load PDF');
      setPdfUrl(null);
    } finally {
      // Ensure loading is turned off after the operation
      setLoading(false);
    }
  }

  // Return the current state for use in components
  return { pdfUrl, loading, error, iframeError, proxyUrl, originalUrl, handleIframeError, handleRetry };
}
