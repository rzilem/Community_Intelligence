import { useState, useEffect } from 'react';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { Invoice } from '@/types/invoice-types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { normalizeUrl } from '@/components/invoices/preview/utils/urlUtils';

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
    description: '',
  });

  const [lines, setLines] = useState([{
    glAccount: '',
    fund: 'Operating',
    bankAccount: 'Operating',
    description: '',
    amount: '0',  // Changed to string for consistent input handling
  }]);

  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useSupabaseQuery(
    'invoices',
    {
      select: 'id, status', // Added status for filtering pending invoices
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

  const saveInvoice = async () => {
    console.group('Saving Invoice');
    console.log("Invoice to save:", {
      vendor: invoice.vendor,
      association_id: invoice.association || null,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      amount: invoice.totalAmount,
      status: invoice.status,
      payment_method: invoice.paymentType,
    });
    
    try {
      // Send the association_id as null if it's an empty string to avoid UUID validation errors
      // This is crucial for proper handling in the database
      const association_id = invoice.association ? invoice.association : null;
      console.log('Final association_id value being sent:', association_id);
      console.log('Final vendor value being sent:', invoice.vendor);
      
      const result = await updateInvoice({
        id: invoice.id,
        data: {
          vendor: invoice.vendor,
          association_id: association_id,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          due_date: invoice.dueDate,
          amount: invoice.totalAmount,
          status: invoice.status,
          payment_method: invoice.paymentType,
        }
      });
      
      console.log('Save result:', result);
      console.groupEnd();
      return result;
    } catch (error) {
      console.error("Error saving invoice:", error);
      console.groupEnd();
      throw error;
    }
  };

  // Calculate lineTotal by safely converting string amounts to numbers
  const lineTotal = lines.reduce((sum, line) => {
    const amount = typeof line.amount === 'string' ? parseFloat(line.amount) || 0 : line.amount || 0;
    return sum + amount;
  }, 0);
  
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
    saveInvoice,
    isNewInvoice
  };
};
