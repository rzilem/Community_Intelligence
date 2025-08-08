
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { Receipt } from 'lucide-react';
import { useInvoiceDetail } from '@/hooks/invoices/useInvoiceDetail';
import { InvoiceErrorAlert } from '@/components/invoices/detail/InvoiceErrorAlert';
import { InvoiceNavigationManager } from '@/components/invoices/detail/InvoiceNavigationManager';
import { InvoiceDetailContent } from '@/components/invoices/detail/InvoiceDetailContent';
import { useInvoiceActions } from '@/hooks/invoices/useInvoiceActions';
import { toast } from 'sonner';

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

  // Enhanced debug logging for PDF preview troubleshooting
  useEffect(() => {
    console.group("🔍 Invoice PDF Debug Information");
    console.log("Invoice ID:", id);
    console.log("PDF URL:", invoice.pdfUrl || 'none');
    console.log("PDF URL Length:", invoice.pdfUrl?.length || 0);
    console.log("HTML Content Length:", invoice.htmlContent?.length || 0);
    console.log("Email Content Length:", invoice.emailContent?.length || 0);
    
    if (invoice.pdfUrl) {
      console.log("PDF URL Analysis:", {
        isAbsolute: invoice.pdfUrl.startsWith('http'),
        hasDoubleSlashes: invoice.pdfUrl.includes('//'),
        domain: invoice.pdfUrl.includes('supabase.co') ? 'Supabase' : 'Other',
        extension: invoice.pdfUrl.toLowerCase().includes('.pdf') ? 'PDF' : 'Unknown'
      });
      
      // Test direct access to PDF URL
      console.log("Testing PDF URL accessibility...");
      fetch(invoice.pdfUrl, { method: 'HEAD' })
        .then(response => {
          console.log("PDF URL Test Result:", {
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            accessible: response.ok
          });
        })
        .catch(error => {
          console.log("PDF URL Test Failed (might be CORS):", error.message);
        });
    }
    
    console.groupEnd();
  }, [invoice, id]);

  const handleNavigate = (invoiceId: string) => {
    navigate(`/accounting/invoice-queue/${invoiceId}`);
  };

  const handleApproveAndNext = () => {
    if (!id || !allInvoices || allInvoices.length === 0) return;
    const pending = allInvoices.filter((inv: any) => inv.status === 'pending');
    if (pending.length === 0) {
      toast.info('No pending invoices left');
      navigate('/accounting/invoice-queue');
      return;
    }
    const currentIndex = pending.findIndex((inv: any) => inv.id === id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % pending.length;
    const nextId = pending[nextIndex].id;

    updateInvoice({
      id: id as string,
      data: { status: 'approved' }
    }, {
      onSuccess: () => {
        toast.success('Invoice approved');
        navigate(`/accounting/invoice-queue/${nextId}`);
      },
      onError: (error: Error) => {
        toast.error(`Error approving invoice: ${error.message}`);
      }
    });
  };

  return (
    <AppLayout>
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
            handleApproveAndNext={handleApproveAndNext}
            isSaving={isSaving}
          />
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default InvoiceDetail;
