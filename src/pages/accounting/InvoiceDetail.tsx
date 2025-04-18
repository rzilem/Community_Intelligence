
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { InvoiceHeader } from '@/components/invoices/InvoiceHeader';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { InvoiceNavigation } from '@/components/invoices/InvoiceNavigation';
import { useInvoiceDetail } from '@/hooks/invoices/useInvoiceDetail';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const {
    invoice,
    lines,
    setLines,
    handleInvoiceChange,
    lineTotal,
    isBalanced,
    allInvoices,
    isLoadingAllInvoices,
    updateInvoice,
    isNewInvoice
  } = useInvoiceDetail(id);

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
    }, {
      onSuccess: () => {
        toast({
          title: "Invoice updated",
          description: "The invoice has been updated successfully.",
        });
      }
    });
  };

  const handleApprove = () => {
    updateInvoice({
      id: invoice.id,
      data: {
        status: 'approved'
      }
    }, {
      onSuccess: () => navigate("/accounting/invoice-queue")
    });
  };

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
      title={isNewInvoice ? 'New Invoice' : `Invoice #${id}`}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-6">
        <InvoiceNavigation 
          isNewInvoice={isNewInvoice}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onNavigate={navigateToInvoice}
          disableNavigation={isLoadingAllInvoices || (allInvoices?.length || 0) <= 1}
        />

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
