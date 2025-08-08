
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import InvoiceHeader from '@/components/invoices/InvoiceHeader';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { Button } from '@/components/ui/button';

interface InvoiceDetailContentProps {
  invoice: any;
  lines: any[];
  setLines: (lines: any[]) => void;
  handleInvoiceChange: (field: string, value: string | number) => void;
  lineTotal: number;
  isBalanced: boolean;
  showPreview: boolean;
  handleSave: () => void;
  handleApprove: () => void;
  handleApproveAndNext?: () => void;
  isSaving: boolean;
}

export const InvoiceDetailContent: React.FC<InvoiceDetailContentProps> = ({
  invoice,
  lines,
  setLines,
  handleInvoiceChange,
  lineTotal,
  isBalanced,
  showPreview,
  handleSave,
  handleApprove,
  handleApproveAndNext,
  isSaving
}) => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={showPreview ? 60 : 100}>
        <div className="p-4 h-full space-y-6">
          <InvoiceHeader
            invoice={invoice}
            onInvoiceChange={handleInvoiceChange}
            aiConfidence={invoice.ai_confidence}
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

          {handleApproveAndNext && (
            <div className="flex justify-end">
              <Button onClick={handleApproveAndNext} disabled={isSaving}>
                Approve & Next
              </Button>
            </div>
          )}
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
  );
};
