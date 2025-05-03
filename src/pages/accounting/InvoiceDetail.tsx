
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';
import { useInvoiceDetail } from '@/hooks/invoices/useInvoiceDetail';
import { InvoiceErrorAlert } from '@/components/invoices/detail/InvoiceErrorAlert';
import { InvoiceNavigationManager } from '@/components/invoices/detail/InvoiceNavigationManager';
import { InvoiceDetailContent } from '@/components/invoices/detail/InvoiceDetailContent';
import { useInvoiceActions } from '@/hooks/invoices/useInvoiceActions';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    invoice,
    lines,
    setLines,
    handleInvoiceChange,
    lineTotal,
    isBalanced,
    allInvoices,
    isLoadingAllInvoices,
    saveInvoice,
    updateInvoice,
    isNewInvoice
  } = useInvoiceDetail(id);

  const {
    isSaving,
    previewError,
    handleSave,
    handleApprove
  } = useInvoiceActions(saveInvoice, updateInvoice, invoice);

  // Debug logging
  useEffect(() => {
    console.group("Invoice Data Debug");
    console.log("Invoice ID:", id);
    console.log("Invoice Data:", {
      association: invoice.association,
      vendor: invoice.vendor,
      invoiceNumber: invoice.invoiceNumber,
      hasHtmlContent: !!invoice.htmlContent,
      htmlContentLength: invoice.htmlContent?.length || 0,
      hasPdfUrl: !!invoice.pdfUrl,
      pdfUrl: invoice.pdfUrl || 'none',
      hasEmailContent: !!invoice.emailContent,
      emailContentLength: invoice.emailContent?.length || 0
    });
    console.groupEnd();
  }, [invoice, id]);

  const handleNavigate = (invoiceId: string) => {
    navigate(`/accounting/invoice-queue/${invoiceId}`);
  };

  return (
    <PageTemplate 
      title={isNewInvoice ? 'New Invoice' : `Invoice #${id}`}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-4">
        <InvoiceErrorAlert error={previewError} />
        
        <InvoiceNavigationManager 
          isNewInvoice={isNewInvoice}
          allInvoices={allInvoices}
          isLoadingAllInvoices={isLoadingAllInvoices}
          currentId={id || ''}
          onNavigate={handleNavigate}
        />

        <InvoiceDetailContent 
          invoice={invoice}
          lines={lines}
          setLines={setLines}
          handleInvoiceChange={handleInvoiceChange}
          lineTotal={lineTotal}
          isBalanced={isBalanced}
          showPreview={true}
          handleSave={handleSave}
          handleApprove={handleApprove}
          isSaving={isSaving}
        />
      </div>
    </PageTemplate>
  );
};

export default InvoiceDetail;
