
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
  const { toast } = useToast();
  
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    console.log("Invoice data in component:", {
      association: invoice.association,
      vendor: invoice.vendor,
      invoiceNumber: invoice.invoiceNumber,
      hasEmailContent: !!invoice.emailContent,
      emailContentLength: invoice.emailContent?.length || 0,
      pdfUrl: invoice.pdfUrl || 'none'
    });
  }, [invoice]);

  const handleSave = async () => {
    console.log("Saving invoice with association:", invoice.association);
    console.log("Saving invoice with vendor:", invoice.vendor);
    
    if (isSaving) return; // Prevent multiple save attempts
    
    setIsSaving(true);
    
    try {
      await saveInvoice();
      
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving invoice:", error);
      
      let errorMessage = "There was an error updating the invoice. Please try again.";
      
      if (error instanceof Error && error.message.includes("uuid")) {
        errorMessage = "There was an error with the association field. Please select a valid association or leave it empty.";
      }
      
      toast({
        title: "Error updating invoice",
        description: errorMessage,
        variant: "destructive"
      });
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
      onSuccess: () => navigate("/accounting/invoice-queue")
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
    
    // Use navigate to change routes without triggering a full page reload
    navigate(`/accounting/invoice-queue/${pendingInvoices[nextIndex].id}`, { replace: true });
  };

  return (
    <PageTemplate 
      title={isNewInvoice ? 'New Invoice' : `Invoice #${id}`}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-4">
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
