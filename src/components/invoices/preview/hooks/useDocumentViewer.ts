import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export function useDocumentViewer(invoiceId: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('pdf_url')
          .eq('id', invoiceId)
          .single();

        if (fetchError) throw new Error(fetchError.message);
        if (!invoice.pdf_url) throw new Error('No PDF URL found');

        // If pdf_url is not a signed URL, generate one
        if (!invoice.pdf_url.includes('token=')) {
          const filename = invoice.pdf_url.split('/').pop();
          const { data: signedData, error: signedError } = await supabase.storage
            .from('invoices')
            .createSignedUrl(filename, 3600);

          if (signedError) throw new Error(signedError.message);
          setPdfUrl(signedData.signedUrl);
        } else {
          setPdfUrl(invoice.pdf_url);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPdfUrl();
  }, [invoiceId]);

  return { pdfUrl, loading, error };
}
