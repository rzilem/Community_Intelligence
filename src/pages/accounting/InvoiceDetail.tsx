import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { InvoiceHeader } from '@/components/invoices/InvoiceHeader';
import { InvoiceSummary } from '@/components/invoices/InvoiceSummary';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import OriginalEmailTab from '@/components/homeowners/detail/tabs/OriginalEmailTab';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewInvoice = id === 'new';
  const invoiceTitle = isNewInvoice ? 'New Invoice' : `Invoice #${id}`;

  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

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

  return (
    <PageTemplate 
      title={invoiceTitle}
      icon={<Receipt className="h-8 w-8" />}
      description="Process and code invoice for payment."
    >
      <div className="mt-6 space-y-6">
        <div className="flex justify-end gap-2">
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
                <Card className="h-full">
                  <div className="bg-gray-50 px-4 py-3 border-b font-medium">
                    Invoice Preview
                  </div>
                  <div className="p-0 h-[calc(100%-48px)]">
                    <OriginalEmailTab 
                      htmlContent={invoice.htmlContent} 
                      fullscreenEmail={false}
                      setFullscreenEmail={() => {}}
                    />
                  </div>
                </Card>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </PageTemplate>
  );
};

export default InvoiceDetail;
