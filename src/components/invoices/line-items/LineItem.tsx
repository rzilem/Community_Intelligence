
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export interface LineItemData {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: string | number;
  isAiGenerated?: boolean;
}

interface LineItemProps {
  line: LineItemData;
  index: number;
  isFirst?: boolean;
  showPreview?: boolean;
  onLineChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  linesCount: number;
}

const LineItem: React.FC<LineItemProps> = ({
  line,
  index,
  isFirst = false,
  showPreview = true,
  onLineChange,
  onRemove,
  linesCount
}) => {
  // Default options if none provided
  const fundOptions = [
    { id: 'Operating', name: 'Operating' },
    { id: 'Reserve', name: 'Reserve' }
  ];
  
  const bankAccountOptions = [
    { id: 'Operating', name: 'Operating Account' },
    { id: 'Reserve', name: 'Reserve Account' }
  ];

  return (
    <div className="grid grid-cols-12 gap-2 items-center mb-2">
      <div className="col-span-3">
        <Input 
          placeholder="GL Account" 
          value={line.glAccount} 
          onChange={(e) => onLineChange(index, 'glAccount', e.target.value)} 
        />
      </div>
      
      <div className="col-span-2">
        <Select 
          value={line.fund} 
          onValueChange={(value) => onLineChange(index, 'fund', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Fund" />
          </SelectTrigger>
          <SelectContent>
            {fundOptions.map(fund => (
              <SelectItem key={fund.id} value={fund.id}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-2">
        <Select 
          value={line.bankAccount} 
          onValueChange={(value) => onLineChange(index, 'bankAccount', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Bank Account" />
          </SelectTrigger>
          <SelectContent>
            {bankAccountOptions.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-3 relative">
        <Input 
          placeholder="Description" 
          value={line.description} 
          onChange={(e) => onLineChange(index, 'description', e.target.value)} 
          className={line.isAiGenerated ? "bg-blue-50 border-blue-300" : ""}
        />
        {line.isAiGenerated && (
          <Sparkles size={16} className="absolute top-2.5 right-2 text-blue-500" />
        )}
      </div>
      
      <div className="col-span-1.5 relative">
        <Input 
          placeholder="Amount" 
          value={line.amount} 
          onChange={(e) => onLineChange(index, 'amount', e.target.value)}
          type="number"
          step="0.01" 
          className={line.isAiGenerated ? "bg-blue-50 border-blue-300" : ""}
        />
        {line.isAiGenerated && (
          <Sparkles size={16} className="absolute top-2.5 right-2 text-blue-500" />
        )}
      </div>
      
      <div className="col-span-0.5 flex justify-center">
        <Button 
          variant="ghost" 
          size="icon" 
          type="button" 
          onClick={() => onRemove(index)}
          disabled={linesCount <= 1 || (isFirst && linesCount > 1)}
          className="hover:bg-red-100 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LineItem;
