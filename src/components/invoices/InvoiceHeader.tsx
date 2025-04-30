
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AssociationSelector from '@/components/associations/AssociationSelector';

interface InvoiceHeaderProps {
  invoice: {
    id: string;
    vendor: string;
    association: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    status: string;
    paymentType: string;
  };
  onInvoiceChange: (field: string, value: string | number) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onInvoiceChange,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Association selection */}
        <div className="space-y-2">
          <Label htmlFor="association">Association</Label>
          <AssociationSelector
            onAssociationChange={(id) => onInvoiceChange('association', id)}
            initialAssociationId={invoice.association}
            label={false}
          />
        </div>

        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={invoice.invoiceNumber}
            onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Date */}
        <div className="space-y-2">
          <Label>Invoice Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !invoice.invoiceDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'PP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(invoice.invoiceDate)}
                onSelect={(date) => onInvoiceChange('invoiceDate', format(date || new Date(), 'yyyy-MM-dd'))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !invoice.dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoice.dueDate ? format(new Date(invoice.dueDate), 'PP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(invoice.dueDate)}
                onSelect={(date) => onInvoiceChange('dueDate', format(date || new Date(), 'yyyy-MM-dd'))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Total */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Invoice Total</Label>
          <Input
            id="totalAmount"
            type="number"
            value={invoice.totalAmount}
            onChange={(e) => onInvoiceChange('totalAmount', parseFloat(e.target.value) || 0)}
            step="0.01"
            className="text-right"
          />
        </div>

        {/* Payment Type */}
        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select
            value={invoice.paymentType}
            onValueChange={(value) => onInvoiceChange('paymentType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="ach">ACH</SelectItem>
              <SelectItem value="wire">Wire Transfer</SelectItem>
              <SelectItem value="card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
