
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, RefreshCw, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

// Mock data for associations, GL accounts, and funds
const associations = [
  { id: '1', name: 'Oakridge Estates' },
  { id: '2', name: 'Lakeside Community' },
  { id: '3', name: 'Highland Towers' },
];

const vendors = [
  { id: '1', name: 'Prime Pool Service', address: 'PO Box 160726' },
  { id: '2', name: 'Landscaping Services Inc.', address: '123 Garden Way' },
  { id: '3', name: 'Security Systems Ltd.', address: '456 Safety Blvd' },
];

const glAccounts = [
  { id: '601', name: 'Pool Maintenance', number: '601' },
  { id: '602', name: 'Landscaping', number: '602' },
  { id: '603', name: 'Security', number: '603' },
  { id: '604', name: 'Utilities', number: '604' },
  { id: '605', name: 'Building Repairs', number: '605' },
];

const funds = [
  { id: '1', name: 'Operating Fund' },
  { id: '2', name: 'Reserve Fund' },
  { id: '3', name: 'Special Assessment Fund' },
];

const bankAccounts = [
  { id: '1', name: 'Operating Account', number: '*****1234' },
  { id: '2', name: 'Reserve Account', number: '*****5678' },
];

const paymentTypes = [
  { id: 'check', name: 'Check' },
  { id: 'ach', name: 'ACH' },
  { id: 'credit_card', name: 'Credit Card' },
  { id: 'transfer', name: 'Transfer' },
];

interface InvoiceLine {
  id: string;
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

const mockInvoice = {
  id: 'INV-001',
  vendor: '1', // Prime Pool Service
  association: '1', // Oakridge Estates
  invoiceNumber: 'PS-12345',
  invoiceDate: '2025-04-08',
  dueDate: '2025-04-22',
  totalAmount: 850.00,
  status: 'pending',
  paymentType: '',
  lines: [] as InvoiceLine[],
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewInvoice = id === 'new';
  const invoiceTitle = isNewInvoice ? 'New Invoice' : `Invoice #${id}`;

  // State for invoice data
  const [invoice, setInvoice] = useState(mockInvoice);
  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: '1',
      glAccount: '',
      fund: '',
      bankAccount: '',
      description: '',
      amount: 0,
    },
  ]);

  // Get vendor details
  const selectedVendor = vendors.find(v => v.id === invoice.vendor);

  // Handle line item changes
  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };
    setLines(updatedLines);
  };

  // Add new line
  const addLine = () => {
    setLines([
      ...lines,
      {
        id: `line-${lines.length + 1}`,
        glAccount: '',
        fund: '',
        bankAccount: '',
        description: '',
        amount: 0,
      },
    ]);
  };

  // Calculate total of line items
  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const isBalanced = Math.abs(lineTotal - invoice.totalAmount) < 0.01;

  // Handle save
  const handleSave = () => {
    toast({
      title: "Invoice saved",
      description: "The invoice has been saved successfully.",
    });
    navigate("/accounting/invoice-queue");
  };

  // Handle approve
  const handleApprove = () => {
    toast({
      title: "Invoice approved",
      description: "The invoice has been approved and is ready for payment.",
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
        {/* Invoice header information */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Association</label>
              <Select value={invoice.association} onValueChange={(value) => setInvoice({...invoice, association: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Association" />
                </SelectTrigger>
                <SelectContent>
                  {associations.map((assoc) => (
                    <SelectItem key={assoc.id} value={assoc.id}>{assoc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <Select value={invoice.vendor} onValueChange={(value) => setInvoice({...invoice, vendor: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVendor && (
                <p className="text-xs text-gray-500 mt-1">{selectedVendor.address}</p>
              )}
            </div>
            
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Invoice Number</label>
              <Input 
                value={invoice.invoiceNumber} 
                onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})} 
                placeholder="Enter invoice number"
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Payment Type</label>
              <Select value={invoice.paymentType} onValueChange={(value) => setInvoice({...invoice, paymentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        {/* Tabs for different invoice views */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="recent">Recent Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <Button size="sm" onClick={addLine} className="gap-1">
                + New Item
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <RefreshCw className="h-4 w-4" /> Refresh GL
              </Button>
            </div>
            
            {/* Line items table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">GL</TableHead>
                    <TableHead className="w-[180px]">Fund</TableHead>
                    <TableHead className="w-[180px]">Bank Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[150px] text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Select 
                          value={line.glAccount}
                          onValueChange={(value) => updateLine(index, 'glAccount', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Account" />
                          </SelectTrigger>
                          <SelectContent>
                            {glAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.number} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={line.fund}
                          onValueChange={(value) => updateLine(index, 'fund', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Fund" />
                          </SelectTrigger>
                          <SelectContent>
                            {funds.map((fund) => (
                              <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={line.bankAccount}
                          onValueChange={(value) => updateLine(index, 'bankAccount', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Account" />
                          </SelectTrigger>
                          <SelectContent>
                            {bankAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Enter description"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.amount || ''}
                          onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
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
          </TabsContent>
          
          <TabsContent value="messages">
            <div className="py-8 text-center text-gray-500">
              No messages for this invoice
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="py-8 text-center text-gray-500">
              No recent invoices from this vendor
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Bottom action buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            Payment Amount: <span className="font-semibold">${invoice.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save & Msg
            </Button>
            <Button className="gap-2" onClick={handleApprove} disabled={!isBalanced}>
              <Send className="h-4 w-4" />
              Update
            </Button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default InvoiceDetail;
