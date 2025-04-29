
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
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const maxRetries = 3;

  const handleIframeError = () => {
    console.error('PDF iframe failed to load');
    setIframeError(true);
    
    // Auto retry once if iframe fails to load
    if (retryCount < 1) {
      setTimeout(() => {
        handleRetry();
      }, 1000);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    setIframeError(false);
    setRetryCount(prevCount => prevCount + 1);
    
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
    if (invoiceId) {
      setRetryCount(0); // Reset retry count on new invoiceId
      fetchPdfUrl();
    }
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
      
      // Normalize URL to remove double slashes (excluding protocol://)
      if (finalUrl.includes('://')) {
        const [protocol, path] = finalUrl.split('://');
        // Only replace double slashes in the path portion, not in query params
        if (path.includes('?')) {
          const [pathPart, queryPart] = path.split('?');
          const normalizedPath = pathPart.replace(/\/+/g, '/');
          finalUrl = `${protocol}://${normalizedPath}?${queryPart}`;
        } else {
          const normalizedPath = path.replace(/\/+/g, '/');
          finalUrl = `${protocol}://${normalizedPath}`;
        }
      } else {
        finalUrl = finalUrl.replace(/\/+/g, '/');
      }
      console.log('Normalized URL:', finalUrl);

      // Check if the URL is not a signed URL (lacks 'token=') and generate one if needed
      if (!finalUrl.includes('token=')) {
        // Use source_document or extract filename from URL
        const filename = invoice.source_document || finalUrl.split('/').pop();
        
        if (!filename) {
          throw new Error('Could not determine filename for signed URL');
        }
        
        console.log('Generating signed URL for:', filename);
        
        // Check if the filename includes the "invoices/" prefix
        const storageFilename = filename.startsWith('invoices/') 
          ? filename.substring('invoices/'.length) // Remove the "invoices/" prefix
          : filename;
          
        console.log('Storage path for signed URL:', storageFilename);
        
        const { data: signedData, error: signedError } = await supabase.storage
          .from('invoices')
          .createSignedUrl(storageFilename, 3600); // Signed URL valid for 1 hour

        if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
        finalUrl = signedData.signedUrl;
        setProxyUrl(finalUrl);
        
        console.log('Generated signed URL:', finalUrl);
      }

      console.log('Final PDF URL:', finalUrl);
      
      // Set the verified URL in state
      setPdfUrl(finalUrl);
    } catch (err: any) {
      // Capture and set any errors
      console.error('Error in fetchPdfUrl:', err);
      setError(err.message || 'Failed to load PDF');
      setPdfUrl(null);
      
      // Auto retry if we haven't exceeded max retries
      if (retryCount < maxRetries - 1) {
        console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          setRetryCount(prevCount => prevCount + 1);
          fetchPdfUrl();
        }, 2000); // Retry after 2 seconds
      }
    } finally {
      // Ensure loading is turned off after the operation
      if (retryCount >= maxRetries - 1 || pdfUrl) {
        setLoading(false);
      }
    }
  }

  // Return the current state for use in components
  return { 
    pdfUrl, 
    loading, 
    error, 
    iframeError, 
    proxyUrl, 
    originalUrl, 
    handleIframeError, 
    handleRetry 
  };
}
