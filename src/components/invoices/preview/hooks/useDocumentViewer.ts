import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to fetch and manage a PDF URL for viewing.
 * @param pdfUrlOrId - The PDF URL or invoice ID to fetch the PDF for.
 * @returns An object containing the PDF URL, loading state, and any errors.
 */
export function useDocumentViewer(pdfUrlOrId: string) {
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

  // Effect to fetch the PDF URL when pdfUrlOrId changes
  useEffect(() => {
    if (pdfUrlOrId) {
      setRetryCount(0); // Reset retry count on new pdfUrlOrId
      fetchPdfUrl();
    }
  }, [pdfUrlOrId]);

  // Function to fetch PDF URL
  async function fetchPdfUrl() {
    try {
      // Reset states at the start of the fetch
      setLoading(true);
      setError(null);
      setIframeError(false);

      console.log('Fetching PDF URL for:', pdfUrlOrId);
      let finalUrl;

      // If pdfUrlOrId is actually a URL, use it directly
      if (pdfUrlOrId?.includes('http')) {
        console.log('Using direct URL:', pdfUrlOrId);
        
        try {
          // If the URL isn't a signed URL, create one
          if (!pdfUrlOrId.includes('token=')) {
            // Extract the filename from the URL
            const urlObj = new URL(pdfUrlOrId);
            const path = urlObj.pathname;
            const filename = path.substring(path.lastIndexOf('/') + 1);
            
            console.log('Generating signed URL for filename:', filename);
            
            // Create a signed URL for the file
            const { data: signedData, error: signedError } = await supabase.storage
              .from('invoices')
              .createSignedUrl(filename, 3600); // Signed URL valid for 1 hour
              
            if (signedError) {
              console.error('Error creating signed URL:', signedError);
              finalUrl = pdfUrlOrId; // Fallback to the original URL
            } else {
              finalUrl = signedData.signedUrl;
              console.log('Generated new signed URL:', finalUrl);
            }
          } else {
            finalUrl = pdfUrlOrId;
          }
        } catch (urlError) {
          console.error('Error processing URL:', urlError);
          finalUrl = pdfUrlOrId; // Fallback to the original URL
        }
      } 
      // If pdfUrlOrId is actually a filename
      else if (pdfUrlOrId?.includes('.pdf')) {
        console.log('Using filename directly:', pdfUrlOrId);
        try {
          // Create a signed URL for the file
          const { data: signedData, error: signedError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(pdfUrlOrId, 3600); // Signed URL valid for 1 hour

          if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
          
          // Store the original URL for reference
          setOriginalUrl(pdfUrlOrId);
          setProxyUrl(signedData.signedUrl);
          finalUrl = signedData.signedUrl;
        } catch (directError) {
          console.error('Error treating pdfUrlOrId as filename:', directError);
          throw new Error('Invalid PDF filename');
        }
      } 
      // Otherwise assume pdfUrlOrId is an invoice ID
      else {
        // Fetch invoice data from Supabase 'invoices' table
        console.log('Fetching invoice data for ID:', pdfUrlOrId);
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('pdf_url, source_document')
          .eq('id', pdfUrlOrId)
          .single();

        // Handle fetch errors or missing data
        if (fetchError) throw new Error(`Failed to fetch invoice: ${fetchError.message}`);
        if (!invoice) throw new Error('Invoice not found');
        if (!invoice.pdf_url) throw new Error('No PDF URL found for this invoice');

        console.log('Found invoice with pdf_url:', invoice.pdf_url);
        
        // Store the original URL for reference
        setOriginalUrl(invoice.pdf_url);
        
        // If pdf_url is a signed URL and still valid, use it directly
        if (invoice.pdf_url.includes('token=')) {
          const tokenParam = new URLSearchParams(invoice.pdf_url.split('?')[1]).get('token');
          if (tokenParam) {
            try {
              // Check if token is still valid by decoding JWT
              const payload = JSON.parse(atob(tokenParam.split('.')[1]));
              const expiry = payload.exp * 1000; // Convert to milliseconds
              
              if (expiry > Date.now()) {
                console.log('Using existing signed URL (still valid)');
                finalUrl = invoice.pdf_url;
              } else {
                console.log('Existing signed URL expired, creating new one');
                // Token expired, create a new signed URL
                await createNewSignedUrl(invoice);
                return; // Return early as createNewSignedUrl updates state
              }
            } catch (e) {
              console.error('Error decoding token:', e);
              await createNewSignedUrl(invoice);
              return;
            }
          }
        } else {
          await createNewSignedUrl(invoice);
          return;
        }
      }

      // Normalize URL to remove double slashes (excluding protocol://)
      if (finalUrl?.includes('://')) {
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
      }
      
      console.log('Final PDF URL:', finalUrl);
      
      // Set the verified URL in state
      setPdfUrl(finalUrl);
      setLoading(false);
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
      } else {
        setLoading(false);
      }
    }
  }

  // Helper function to create a new signed URL
  async function createNewSignedUrl(invoice: any) {
    try {
      // We need to create a new signed URL
      // Use source_document if available or extract filename from URL
      const filename = invoice.source_document || 
                      (invoice.pdf_url ? invoice.pdf_url.split('/').pop() : null);
      
      if (!filename) {
        throw new Error('Could not determine filename for signed URL');
      }
      
      console.log('Generating signed URL for:', filename);
      
      // Determine if the filename includes storage path prefix
      const storageFilename = filename.startsWith('invoices/') 
        ? filename.substring('invoices/'.length) // Remove the path prefix
        : filename;
        
      console.log('Storage path for signed URL:', storageFilename);
      
      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 3600); // Signed URL valid for 1 hour

      if (signedError) throw new Error(`Failed to generate signed URL: ${signedError.message}`);
      
      const finalUrl = signedData.signedUrl;
      setProxyUrl(finalUrl);
      
      console.log('Generated new signed URL:', finalUrl);
      
      setPdfUrl(finalUrl);
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating new signed URL:', err);
      setError(err.message || 'Failed to generate PDF URL');
      setLoading(false);
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
