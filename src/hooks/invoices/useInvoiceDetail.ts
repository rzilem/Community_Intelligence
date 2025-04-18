import { useState, useEffect } from 'react';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { Invoice } from '@/types/invoice-types';
import { format } from 'date-fns';

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
      console.group('Invoice Data Logging');
      console.log("Raw Invoice Data:", invoiceData);
      console.log("PDF URL Field:", invoiceData.pdf_url);
      console.log("HTML Content Field:", invoiceData.html_content);
      console.groupEnd();
      
      // Enhanced PDF URL fallback strategy
      const pdfUrl = 
        invoiceData.pdf_url || 
        ((!invoiceData.html_content || invoiceData.html_content.length === 0) 
          ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
          : '');
      
      setInvoice({
        id: invoiceData.id,
        vendor: invoiceData.vendor || '',
        association: invoiceData.association_id || '',
        invoiceNumber: invoiceData.invoice_number || '',
        invoiceDate: invoiceData.invoice_date || format(new Date(), 'yyyy-MM-dd'),
        dueDate: invoiceData.due_date || format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        totalAmount: invoiceData.amount || 0,
        status: invoiceData.status || 'pending',
        paymentType: invoiceData.payment_method || '',
        htmlContent: invoiceData.html_content || '',
        pdfUrl,
      });
    }
  }, [invoiceData]);

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
