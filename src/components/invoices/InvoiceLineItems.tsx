
import React from 'react';
import { 
  Select as UISelect, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form';

// Custom Select component that includes a label
interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const Select = ({ label, value, onChange, options }: CustomSelectProps) => (
  <div className="space-y-2">
    <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</Label>
    <UISelect value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
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

interface InvoiceLineItemsProps {
  lines: Array<{
    glAccount: string;
    fund: string;
    bankAccount: string;
    description: string;
    amount: number;
  }>;
  onLinesChange: (lines: any[]) => void;
  associationId?: string;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines,
  onLinesChange,
  associationId
}) => {
  // Add default values for Operating account
  const handleAddLine = () => {
    onLinesChange([
      ...lines,
      {
        glAccount: '',
        fund: 'Operating', // Default to Operating fund
        bankAccount: 'Operating', // Default to Operating bank account
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
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Line Items</h3>
      {lines.map((line, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id={`description-${index}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={line.description}
              onChange={(e) => handleLineChange(index, 'description', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`amount-${index}`} className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id={`amount-${index}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={line.amount}
              onChange={(e) => handleLineChange(index, 'amount', Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={() => handleRemoveLine(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={handleAddLine}
        >
          Add Line
        </button>
      </div>
    </div>
  );
};

export default InvoiceLineItems;
