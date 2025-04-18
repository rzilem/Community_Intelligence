
import React from 'react';
import { 
  Select as UISelect, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';

// Define the CustomSelectProps interface
interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

// Define the LineItem interface
interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

// Define the InvoiceLineItemsProps interface
interface InvoiceLineItemsProps {
  lines: LineItem[];
  onLinesChange: (lines: LineItem[]) => void;
  associationId?: string;
}

const Select = ({ label, value, onChange, options }: CustomSelectProps) => (
  <div className="space-y-2">
    <Label className="text-sm text-gray-600">{label}</Label>
    <UISelect value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-primary/50">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UISelect>
  </div>
);

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines,
  onLinesChange,
  associationId
}) => {
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
        <div 
          key={index} 
          className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <Select
            label="GL Account"
            value={line.glAccount}
            onChange={(value) => handleLineChange(index, 'glAccount', value)}
            options={[
              { value: 'Account1', label: 'Account 1' },
              { value: 'Account2', label: 'Account 2' },
            ]}
          />
          <Select
            label="Fund"
            value={line.fund}
            onChange={(value) => handleLineChange(index, 'fund', value)}
            options={[
              { value: 'Operating', label: 'Operating' },
              { value: 'Reserve', label: 'Reserve' },
            ]}
          />
          <Select
            label="Bank Account"
            value={line.bankAccount}
            onChange={(value) => handleLineChange(index, 'bankAccount', value)}
            options={[
              { value: 'Operating', label: 'Operating' },
              { value: 'Reserve', label: 'Reserve' },
            ]}
          />
          <div className="md:col-span-2">
            <Label htmlFor={`description-${index}`} className="text-sm text-gray-600">
              Description
            </Label>
            <input
              type="text"
              id={`description-${index}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50 sm:text-sm"
              value={line.description}
              onChange={(e) => handleLineChange(index, 'description', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`amount-${index}`} className="text-sm text-gray-600">
              Amount
            </Label>
            <input
              type="number"
              id={`amount-${index}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50 sm:text-sm"
              value={line.amount}
              onChange={(e) => handleLineChange(index, 'amount', Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleRemoveLine(index)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceLineItems;
