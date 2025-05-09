
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
  item: LineItemData;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string | number) => void;
  glAccounts?: { id: string; name: string }[];
  funds?: { id: string; name: string }[];
  bankAccounts?: { id: string; name: string }[];
  disableRemove?: boolean;
}

const LineItem: React.FC<LineItemProps> = ({
  item,
  index,
  onRemove,
  onChange,
  glAccounts = [],
  funds = [],
  bankAccounts = [],
  disableRemove = false
}) => {
  // Default options if none provided
  const fundOptions = funds.length > 0 ? funds : [
    { id: 'Operating', name: 'Operating' },
    { id: 'Reserve', name: 'Reserve' }
  ];
  
  const bankAccountOptions = bankAccounts.length > 0 ? bankAccounts : [
    { id: 'Operating', name: 'Operating Account' },
    { id: 'Reserve', name: 'Reserve Account' }
  ];

  return (
    <div className="grid grid-cols-12 gap-2 items-center mb-2">
      <div className="col-span-3">
        {glAccounts && glAccounts.length > 0 ? (
          <Select 
            value={item.glAccount} 
            onValueChange={(value) => onChange(index, 'glAccount', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select GL Account" />
            </SelectTrigger>
            <SelectContent>
              {glAccounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input 
            placeholder="GL Account" 
            value={item.glAccount} 
            onChange={(e) => onChange(index, 'glAccount', e.target.value)} 
          />
        )}
      </div>
      
      <div className="col-span-2">
        <Select 
          value={item.fund} 
          onValueChange={(value) => onChange(index, 'fund', value)}
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
          value={item.bankAccount} 
          onValueChange={(value) => onChange(index, 'bankAccount', value)}
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
          value={item.description} 
          onChange={(e) => onChange(index, 'description', e.target.value)} 
          className={item.isAiGenerated ? "bg-blue-50 border-blue-300" : ""}
        />
        {item.isAiGenerated && (
          <Sparkles size={16} className="absolute top-2.5 right-2 text-blue-500" />
        )}
      </div>
      
      <div className="col-span-1.5 relative">
        <Input 
          placeholder="Amount" 
          value={item.amount} 
          onChange={(e) => onChange(index, 'amount', e.target.value)}
          type="number"
          step="0.01" 
          className={item.isAiGenerated ? "bg-blue-50 border-blue-300" : ""}
        />
        {item.isAiGenerated && (
          <Sparkles size={16} className="absolute top-2.5 right-2 text-blue-500" />
        )}
      </div>
      
      <div className="col-span-0.5 flex justify-center">
        <Button 
          variant="ghost" 
          size="icon" 
          type="button" 
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          className="hover:bg-red-100 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LineItem;
