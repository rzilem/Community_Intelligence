
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { InvoiceHeader } from '@/components/invoices/InvoiceHeader';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewInvoice = id === 'new';
  const invoiceTitle = isNewInvoice ? 'New Invoice' : `Invoice #${id}`;

  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // Get all invoices for navigation
  const { data: allInvoices, isLoading: isLoadingAllInvoices } = useSupabaseQuery(
    'invoices',
    {
      select: 'id',
      order: [{ column: 'created_at', ascending: false }]
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

  const { mutate: updateInvoice } = useSupabaseUpdate('invoices', {
    onSuccess: () => {
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
    }
  });

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

  useEffect(() => {
    if (invoiceData) {
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
        pdfUrl: invoiceData.pdf_url || '',
      });
    }
  }, [invoiceData]);

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoice({ ...invoice, [field]: value });
  };

  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const isBalanced = Math.abs(lineTotal - invoice.totalAmount) < 0.01;

  const handleSave = () => {
    updateInvoice({
      id: invoice.id,
      data: {
        vendor: invoice.vendor,
        association_id: invoice.association,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        amount: invoice.totalAmount,
        status: invoice.status,
        payment_method: invoice.paymentType,
      }
    });
  };

  const handleApprove = () => {
    updateInvoice({
      id: invoice.id,
      data: {
        status: 'approved'
      }
    });
    navigate("/accounting/invoice-queue");
  };

  // Navigation functions
  const navigateToInvoice = (direction: 'next' | 'prev') => {
    if (!allInvoices || allInvoices.length === 0) return;
    
    const currentIndex = allInvoices.findIndex(inv => inv.id === id);
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % allInvoices.length;
    } else {
      nextIndex = (currentIndex - 1 + allInvoices.length) % allInvoices.length;
    }
    
    navigate(`/accounting/invoice-queue/${allInvoices[nextIndex].id}`);
  };

  return (
    <PageTemplate 
      title={invoiceTitle}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-6">
        <div className="flex justify-between">
          <div className="flex gap-2">
            {!isNewInvoice && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateToInvoice('prev')}
                  disabled={isLoadingAllInvoices || allInvoices?.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateToInvoice('next')}
                  disabled={isLoadingAllInvoices || allInvoices?.length <= 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)}
            className="gap-1"
          >
            {showPreview ? (
              <><Minimize2 className="h-4 w-4" /> Hide Preview</>
            ) : (
              <><Maximize2 className="h-4 w-4" /> Show Preview</>
            )}
          </Button>
        </div>

        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60}>
            <div className="p-4 h-full space-y-6">
              <InvoiceHeader 
                invoice={invoice}
                onInvoiceChange={handleInvoiceChange}
              />
              
              <InvoiceLineItems 
                lines={lines}
                onLinesChange={setLines}
                associationId={invoice.association}
              />
              
              <InvoiceSummary 
                lineTotal={lineTotal}
                invoiceTotal={invoice.totalAmount}
                isBalanced={isBalanced}
                onSave={handleSave}
                onApprove={handleApprove}
              />
            </div>
          </ResizablePanel>
          
          {showPreview && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={40}>
                <InvoicePreview 
                  htmlContent={invoice.htmlContent} 
                  pdfUrl={invoice.pdfUrl}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </PageTemplate>
  );
};

export default InvoiceDetail;
