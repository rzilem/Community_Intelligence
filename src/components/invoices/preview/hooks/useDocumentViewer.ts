
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDocumentViewer(invoiceId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const handleIframeError = () => {
    console.error("Error loading PDF in iframe");
    setIframeError(true);
  };

  const handleRetry = () => {
    setIframeError(false);
    fetchPdfUrl();
  };

  const fetchPdfUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      setIframeError(false);

      console.log(`Fetching PDF URL for invoice: ${invoiceId}`);
      
      if (!invoiceId) {
        setLoading(false);
        return;
      }
      
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
      
      setOriginalUrl(invoice.pdf_url);

      // Create a proxy URL to handle the PDF display more reliably
      if (import.meta.env.VITE_SUPABASE_URL) {
        const pdfProxyEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pdf-proxy`;
        const proxyUrl = `${pdfProxyEndpoint}?pdf=${encodeURIComponent(invoice.pdf_url)}`;
        
        console.log(`Generated proxy URL: ${proxyUrl}`);
        setProxyUrl(proxyUrl);
      } else {
        console.warn("VITE_SUPABASE_URL environment variable not found, using original PDF URL");
      }
      
      setPdfUrl(invoice.pdf_url);
    } catch (err) {
      console.error("useDocumentViewer error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchPdfUrl();
    }
  }, [invoiceId]);

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
