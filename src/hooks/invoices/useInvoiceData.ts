
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default invoice structure
const defaultInvoice = {
  id: '',
  vendor: '',
  amount: 0,
  dueDate: '',
  invoiceDate: '',
  invoiceNumber: '',
  description: '',
  totalAmount: 0,
  status: 'pending',
  association: '',
  htmlContent: '',
  emailContent: '',
  pdfUrl: '',
  paymentType: 'Check',
  aiExtractedData: null,
  ai_confidence: null,
  ai_processing_status: null,
  ai_processed_at: null,
  ai_line_items: null
};

export const useInvoiceData = (id: string | undefined) => {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const isNewInvoice = !id || id === 'new';

  // Mock all invoices for navigation since table doesn't exist
  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      // Return mock invoice data
      return [
        {
          id: '1',
          invoice_number: 'INV-001',
          vendor: 'ABC Services',
          amount: 1500,
          due_date: '2024-01-15',
          status: 'pending'
        }
      ];
    },
    enabled: !isNewInvoice
  });

  // Mock specific invoice data since table doesn't exist
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (isNewInvoice) return null;

      // Return mock invoice data
      return {
        id: id,
        vendor: 'Sample Vendor',
        amount: 1000,
        invoice_number: 'INV-' + id,
        description: 'Sample invoice description',
        association_id: 'default',
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        html_content: '',
        email_content: '',
        pdf_url: '',
        payment_method: 'Check',
        ai_confidence: null,
        ai_line_items: [],
        ai_processing_status: null,
        ai_processed_at: null
      };
    },
    enabled: !isNewInvoice
  });

  // Update local state when invoice data is fetched
  useEffect(() => {
    if (!isLoadingInvoice && invoiceData) {
      // Safely access AI extraction data properties
      const aiConfidence = invoiceData.ai_confidence || null;
      const aiLineItems = invoiceData.ai_line_items || [];
      
      setInvoice({
        id: invoiceData.id || '',
        vendor: invoiceData.vendor || '',
        amount: invoiceData.amount || 0,
        invoiceNumber: invoiceData.invoice_number || '',
        description: invoiceData.description || '',
        association: invoiceData.association_id || '',
        invoiceDate: invoiceData.invoice_date || '',
        dueDate: invoiceData.due_date || '',
        totalAmount: invoiceData.amount || 0,
        status: invoiceData.status || 'pending',
        htmlContent: invoiceData.html_content || '',
        emailContent: invoiceData.email_content || '',
        pdfUrl: invoiceData.pdf_url || '',
        paymentType: invoiceData.payment_method || 'Check',
        aiExtractedData: aiConfidence ? {
          confidence: aiConfidence,
          lineItems: aiLineItems
        } : null,
        ai_confidence: aiConfidence,
        ai_line_items: aiLineItems,
        ai_processing_status: invoiceData.ai_processing_status || null,
        ai_processed_at: invoiceData.ai_processed_at || null
      });
    }
  }, [invoiceData, isLoadingInvoice]);

  // Handle changes to invoice fields
  const handleInvoiceChange = (field: string, value: string | number | boolean) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    invoice,
    setInvoice,
    handleInvoiceChange,
    isNewInvoice,
    isLoadingInvoice,
    allInvoices,
    isLoadingAllInvoices
  };
};
