
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format } from 'date-fns';
import { normalizeUrl } from '@/components/invoices/preview/utils/urlUtils';
import { Invoice } from '@/types/invoice-types';

/**
 * Hook to load invoice data from Supabase
 */
export const useInvoiceData = (id: string | undefined) => {
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
    description: '',
  });

  // Query for the specific invoice by ID
  const { data: invoiceData, isLoading: isLoadingInvoice } = useSupabaseQuery(
    'invoices',
    {
      select: '*',
      filter: [{ column: 'id', value: id, operator: 'eq' }],
      single: true
    },
    !isNewInvoice
  );

  // Query for all invoices (for navigation)
  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useSupabaseQuery(
    'invoices',
    {
      select: 'id, status',
      order: { column: 'created_at', ascending: false },
    },
    !isNewInvoice
  );

  // Load invoice data when available
  useEffect(() => {
    if (invoiceData) {
      console.group('Invoice Data Processing');
      console.log("Raw Invoice Data:", invoiceData);
      
      // Explicitly log association and vendor data
      console.log("Association ID:", {
        raw: invoiceData.association_id,
        type: typeof invoiceData.association_id,
        isValid: !!invoiceData.association_id
      });
      
      console.log("Vendor:", {
        raw: invoiceData.vendor,
        type: typeof invoiceData.vendor
      });

      // Process PDF URL if available
      let normalizedPdfUrl = '';
      if (invoiceData.pdf_url) {
        try {
          normalizedPdfUrl = normalizeUrl(invoiceData.pdf_url);
          console.log("Normalized PDF URL:", normalizedPdfUrl);
        } catch (err) {
          console.error("Error normalizing PDF URL:", err);
          normalizedPdfUrl = invoiceData.pdf_url;
        }
      }
      
      // Ensure full decimal precision for amount
      const fullAmount = invoiceData.amount !== null 
        ? parseFloat(invoiceData.amount.toFixed(2)) 
        : 0;
      
      // Log HTML and email content details
      console.log("HTML Content:", {
        available: !!invoiceData.html_content,
        length: invoiceData.html_content?.length || 0,
        excerpt: invoiceData.html_content ? invoiceData.html_content.substring(0, 100) + '...' : 'none'
      });
      
      console.log("Email Content:", {
        available: !!invoiceData.email_content,
        length: invoiceData.email_content?.length || 0,
        excerpt: invoiceData.email_content ? invoiceData.email_content.substring(0, 100) + '...' : 'none'
      });
      
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
        htmlContent: invoiceData.html_content || '',
        pdfUrl: normalizedPdfUrl || invoiceData.pdf_url || '',
        emailContent: invoiceData.email_content || '',
        description: invoiceData.description || invoiceData.subject || '',
      });

      console.log("Processed Invoice Data:", {
        pdfUrl: normalizedPdfUrl || invoiceData.pdf_url || 'none',
        htmlContentLength: (invoiceData.html_content || '').length,
        emailContentLength: (invoiceData.email_content || '').length
      });

      console.groupEnd();
    }
  }, [invoiceData, id]);

  const handleInvoiceChange = (field: string, value: string | number) => {
    console.log(`Updating invoice field: ${field} with value:`, value);
    
    // For amount fields, ensure we maintain decimal precision
    if (field === 'totalAmount' || field === 'amount') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      setInvoice({ ...invoice, [field]: parseFloat(numValue.toFixed(2)) });
    } else {
      setInvoice({ ...invoice, [field]: value });
    }
  };

  return {
    invoice,
    handleInvoiceChange,
    isNewInvoice,
    isLoadingInvoice,
    allInvoices,
    isLoadingAllInvoices
  };
};
