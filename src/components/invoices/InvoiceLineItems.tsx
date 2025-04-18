import React, { useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';

interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

interface InvoiceLineItemsProps {
  lines: LineItem[];
  onLinesChange: (lines: LineItem[]) => void;
  associationId?: string;
  showPreview?: boolean;
  invoiceTotal: number;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines,
  onLinesChange,
  associationId,
  showPreview = true,
  invoiceTotal = 0
}) => {
  useEffect(() => {
    if (lines.length === 1 && invoiceTotal > 0 && lines[0].amount === 0) {
      const updatedLines = [...lines];
      updatedLines[0].amount = invoiceTotal;
      onLinesChange(updatedLines);
    }
  }, [invoiceTotal, lines, onLinesChange]);

  const handleAddLine = () => {
    onLinesChange([
      ...lines,
      {
        glAccount: '',
        fund: 'Operating',
        bankAccount: 'Operating',
        description: '',
        amount: 0
      }
    ]);
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === 'amount' && index > 0) {
      const totalExcludingFirst = newLines
        .slice(1)
        .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
      newLines[0].amount = invoiceTotal - totalExcludingFirst;
    }

    onLinesChange(newLines);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    onLinesChange(newLines);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800">Line Items</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddLine}
          className="flex items-center gap-2 text-green-600 hover:bg-green-50"
        >
          <PlusCircle className="h-4 w-4" />
          Add Line
        </Button>
      </div>
      
      {lines.map((line, index) => (
        <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 flex items-center justify-center">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => handleRemoveLine(index)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="col-span-11 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">GL Account</Label>
                <Select
                  value={line.glAccount || "none"}
                  onValueChange={(value) => handleLineChange(index, 'glAccount', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select GL Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select GL Account</SelectItem>
                    <SelectItem value="Account1">Account 1</SelectItem>
                    <SelectItem value="Account2">Account 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Fund</Label>
                <Select
                  value={line.fund}
                  onValueChange={(value) => handleLineChange(index, 'fund', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Fund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operating">Operating</SelectItem>
                    <SelectItem value="Reserve">Reserve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Bank Account</Label>
                <Select
                  value={line.bankAccount}
                  onValueChange={(value) => handleLineChange(index, 'bankAccount', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Bank Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operating">Operating</SelectItem>
                    <SelectItem value="Reserve">Reserve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={showPreview ? 'space-y-4' : 'grid grid-cols-5 gap-4'}>
              <div className={showPreview ? 'w-full' : 'col-span-4'}>
                <Label htmlFor={`description-${index}`} className="text-sm font-medium text-gray-600">
                  Description
                </Label>
                <Input
                  id={`description-${index}`}
                  value={line.description}
                  onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`amount-${index}`} className="text-sm font-medium text-gray-600">
                  Amount
                </Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  value={line.amount}
                  onChange={(e) => handleLineChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="mt-2 text-right"
                  step="0.01"
                  disabled={index === 0}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceLineItems;
