import { useState, useEffect } from 'react';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { Invoice } from '@/types/invoice-types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const useInvoiceDetail = (id: string | undefined) => {
  const isNewInvoice = id === 'new';
  const [invoice, setInvoice] = useState({
    id: '',
    vendor: '',
    association: '',
    invoiceNumber: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    totalAmount: 0,
    status: 'pending',
    paymentType: '',
    htmlContent: '',
    pdfUrl: '',
    emailContent: '',
  });

  const [lines, setLines] = useState([{
    glAccount: '',
    fund: '',
    bankAccount: '',
    description: '',
    amount: 0,
  }]);

  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useSupabaseQuery(
    'invoices',
    {
      select: 'id',
      order: { column: 'created_at', ascending: false },
    },
    !isNewInvoice
  );

  const { data: invoiceData, isLoading: isLoadingInvoice } = useSupabaseQuery(
    'invoices',
    {
      select: '*',
      filter: [{ column: 'id', value: id, operator: 'eq' }],
      single: true
    },
    !isNewInvoice
  );

  const { mutate: updateInvoice } = useSupabaseUpdate('invoices');

  useEffect(() => {
    if (invoiceData) {
      console.group('Invoice Data Debug');
      console.log("Invoice ID:", id);
      console.log("Raw Invoice Data:", invoiceData);
      
      // Explicitly check for PDF URL and HTML content
      console.log("PDF URL Check:", {
        raw: invoiceData.pdf_url,
        type: typeof invoiceData.pdf_url,
        length: invoiceData.pdf_url?.length || 0,
        isValid: !!invoiceData.pdf_url && typeof invoiceData.pdf_url === 'string' && invoiceData.pdf_url.trim().length > 0
      });
      
      console.log("HTML Content Check:", {
        exists: !!invoiceData.html_content,
        length: invoiceData.html_content?.length || 0,
        sample: invoiceData.html_content ? invoiceData.html_content.substring(0, 100) + '...' : 'none'
      });
      
      // Get the cleaned values, defaulting to empty strings
      const htmlContent = invoiceData.html_content || '';
      const emailContent = invoiceData.email_content || '';
      
      // Ensure PDF URL is properly formatted
      let pdfUrl = invoiceData.pdf_url || '';
      
      // Analyze HTML content for PDF mentions
      if (htmlContent && !pdfUrl) {
        console.log("Checking HTML content for PDF mentions");
        const pdfMentionRegex = /attach(ed|ment)|pdf|invoice|document/i;
        const hasPdfMention = pdfMentionRegex.test(htmlContent);
        console.log("PDF mention detected:", hasPdfMention);
        
        if (hasPdfMention) {
          // Check communications_log for possible attachments
          // Fix: Using the correct toast syntax for sonner
          toast("The invoice mentions an attachment but no PDF was found");
        }
      }
      
      // Make sure the PDF URL doesn't have any whitespace or control characters
      if (pdfUrl) {
        pdfUrl = pdfUrl.trim();
        
        // Fix common URL issues
        if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://') && !pdfUrl.startsWith('/')) {
          console.log('Adding https:// to PDF URL:', pdfUrl);
          pdfUrl = 'https://' + pdfUrl;
        }
        
        // Log the final PDF URL
        console.log("Final PDF URL after formatting:", pdfUrl);
      }
      
      console.log("Using values:", {
        htmlContent: htmlContent ? 'present' : 'empty',
        pdfUrl: pdfUrl || 'empty',
        emailContent: emailContent ? 'present' : 'empty',
      });
      console.groupEnd();

      // Ensure full decimal precision for amount
      const fullAmount = invoiceData.amount !== null 
        ? parseFloat(invoiceData.amount.toFixed(2)) 
        : 0;
      
      setInvoice({
        id: invoiceData.id,
        vendor: invoiceData.vendor || '',
        association: invoiceData.association_id || '',
        invoiceNumber: invoiceData.invoice_number || '',
        invoiceDate: invoiceData.invoice_date || format(new Date(), 'yyyy-MM-dd'),
        dueDate: invoiceData.due_date || format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        totalAmount: fullAmount,
        status: invoiceData.status || 'pending',
        paymentType: invoiceData.payment_method || '',
        htmlContent: htmlContent,
        pdfUrl: pdfUrl,
        emailContent: emailContent,
      });
    }
  }, [invoiceData, id]);

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoice({ ...invoice, [field]: value });
  };

  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const isBalanced = Math.abs(lineTotal - invoice.totalAmount) < 0.01;

  return {
    invoice,
    lines,
    setLines,
    handleInvoiceChange,
    lineTotal,
    isBalanced,
    allInvoices,
    isLoadingAllInvoices,
    isLoadingInvoice,
    updateInvoice,
    isNewInvoice
  };
};
