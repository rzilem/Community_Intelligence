
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
  aiExtractedData: null
};

export const useInvoiceData = (id: string | undefined) => {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const isNewInvoice = !id || id === 'new';

  // Fetch all invoices for navigation
  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, vendor, amount, due_date, status')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !isNewInvoice
  });

  // Fetch specific invoice if ID is provided
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (isNewInvoice) return null;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !isNewInvoice
  });

  // Update local state when invoice data is fetched
  useEffect(() => {
    if (!isLoadingInvoice && invoiceData) {
      const aiConfidence = invoiceData._aiConfidence || null;
      const aiLineItems = invoiceData._aiLineItems || [];
      
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
        } : null
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
