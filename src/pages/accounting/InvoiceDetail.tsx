
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Maximize2, Minimize2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useSupabaseQuery, useSupabaseUpdate } from '@/hooks/supabase';
import AssociationSelector from '@/components/associations/AssociationSelector';
import OriginalEmailTab from '@/components/homeowners/detail/tabs/OriginalEmailTab';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewInvoice = id === 'new';
  const invoiceTitle = isNewInvoice ? 'New Invoice' : `Invoice #${id}`;

  // State for managing preview visibility and layout
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // Fetch the invoice if it exists
  const { data: invoiceData, isLoading: isLoadingInvoice } = useSupabaseQuery(
    'invoices',
    {
      select: '*',
      filter: [{ column: 'id', value: id, operator: 'eq' }],
      single: true
    },
    !isNewInvoice
  );

  // Invoice update mutation
  const { mutate: updateInvoice } = useSupabaseUpdate('invoices', {
    onSuccess: () => {
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
    }
  });

  // State for invoice data
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

  // State for line items
  const [lines, setLines] = useState([{
    glAccount: '',
    fund: '',
    bankAccount: '',
    description: '',
    amount: 0,
  }]);

  // Effect to update invoice data when fetched
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

  // Calculate total of line items
  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const isBalanced = Math.abs(lineTotal - invoice.totalAmount) < 0.01;

  // Handle association change
  const handleAssociationChange = (associationId: string) => {
    setInvoice({...invoice, association: associationId});
  };

  // Handle save
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

  // Handle approve
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
        {/* Top action buttons for preview control */}
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
              {/* Invoice header information */}
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Association</label>
                    <AssociationSelector
                      onAssociationChange={handleAssociationChange}
                      initialAssociationId={invoice.association}
                      label={false}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Invoice Number</label>
                    <Input 
                      value={invoice.invoiceNumber} 
                      onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})} 
                      placeholder="Enter invoice number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor</label>
                    <Input 
                      value={invoice.vendor} 
                      onChange={(e) => setInvoice({...invoice, vendor: e.target.value})} 
                      placeholder="Enter vendor name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Invoice Date</label>
                    <Input 
                      type="date" 
                      value={invoice.invoiceDate} 
                      onChange={(e) => setInvoice({...invoice, invoiceDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <Input 
                      type="date" 
                      value={invoice.dueDate} 
                      onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Invoice Total</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={invoice.totalAmount} 
                      onChange={(e) => setInvoice({...invoice, totalAmount: parseFloat(e.target.value)})}
                      className="text-right"
                    />
                  </div>
                </div>
              </Card>
              
              {/* Line Items */}
              <InvoiceLineItems 
                lines={lines}
                onLinesChange={setLines}
                associationId={invoice.association}
              />
              
              {/* Summary and balance */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Line Items Total:</span>
                    <span>${lineTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Invoice Total:</span>
                    <span>${invoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Difference:</span>
                    <span>{isBalanced ? 'Balanced' : `$${Math.abs(lineTotal - invoice.totalAmount).toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom action buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  Payment Amount: <span className="font-semibold">${invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button className="gap-2" onClick={handleApprove} disabled={!isBalanced}>
                    <Send className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
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
