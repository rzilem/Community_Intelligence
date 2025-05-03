
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import InvoiceHeader from '@/components/invoices/InvoiceHeader';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { InvoiceNavigation } from '@/components/invoices/InvoiceNavigation';
import { useInvoiceDetail } from '@/hooks/invoices/useInvoiceDetail';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  const handleSave = async () => {
    console.log("Saving invoice with association:", invoice.association);
    console.log("Saving invoice with vendor:", invoice.vendor);
    
    if (isSaving) return; // Prevent multiple save attempts
    
    setIsSaving(true);
    setPreviewError(null);
    
    try {
      await saveInvoice();
      
      toast.success("Invoice updated successfully");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      
      let errorMessage = "There was an error updating the invoice. Please try again.";
      
      if (error instanceof Error && error.message.includes("uuid")) {
        errorMessage = "There was an error with the association field. Please select a valid association or leave it empty.";
      }
      
      toast.error(errorMessage);
      setPreviewError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = () => {
    updateInvoice({
      id: invoice.id,
      data: {
        status: 'approved'
      }
    }, {
      onSuccess: () => {
        toast.success("Invoice approved successfully");
        navigate("/accounting/invoice-queue");
      },
      onError: (error) => {
        toast.error(`Error approving invoice: ${error.message}`);
        setPreviewError(`Error approving invoice: ${error.message}`);
      }
    });
  };

  // Get pending invoices and current position
  const pendingInvoices = allInvoices?.filter(inv => inv.status === 'pending') || [];
  const currentPosition = pendingInvoices.findIndex(inv => inv.id === id) + 1;
  const totalPending = pendingInvoices.length;

  const navigateToInvoice = (direction: 'next' | 'prev') => {
    if (!allInvoices || allInvoices.length === 0) return;
    
    if (pendingInvoices.length === 0) return;
    
    // Find current index within pending invoices
    const currentIndex = pendingInvoices.findIndex(inv => inv.id === id);
    if (currentIndex === -1) {
      // If current invoice is not pending, navigate to the first pending invoice
      navigate(`/accounting/invoice-queue/${pendingInvoices[0].id}`);
      return;
    }
    
    // Calculate next index
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % pendingInvoices.length;
    } else {
      nextIndex = (currentIndex - 1 + pendingInvoices.length) % pendingInvoices.length;
    }
    
    navigate(`/accounting/invoice-queue/${pendingInvoices[nextIndex].id}`);
  };

  return (
    <PageTemplate 
      title={isNewInvoice ? 'New Invoice' : `Invoice #${id}`}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-4">
        {previewError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        )}
        
        <InvoiceNavigation 
          isNewInvoice={isNewInvoice}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onNavigate={navigateToInvoice}
          disableNavigation={isLoadingAllInvoices || pendingInvoices.length <= 1}
          currentPosition={currentPosition}
          totalPending={totalPending}
        />

        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={showPreview ? 60 : 100}>
            <div className="p-4 h-full space-y-6">
              <InvoiceHeader 
                invoice={invoice}
                onInvoiceChange={handleInvoiceChange}
              />
              
              <InvoiceLineItems 
                lines={lines}
                onLinesChange={setLines}
                associationId={invoice.association}
                showPreview={showPreview}
                invoiceTotal={invoice.totalAmount}
              />
              
              <InvoiceSummary 
                lineTotal={lineTotal}
                invoiceTotal={invoice.totalAmount}
                isBalanced={isBalanced}
                onSave={handleSave}
                onApprove={handleApprove}
                isSaving={isSaving}
              />
            </div>
          </ResizablePanel>
          
          {showPreview && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} className="min-h-[800px]">
                <InvoicePreview 
                  htmlContent={invoice.htmlContent} 
                  pdfUrl={invoice.pdfUrl}
                  emailContent={invoice.emailContent || ''}
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
