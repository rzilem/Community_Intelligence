
import React from 'react';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GLAccount } from '@/types/accounting-types';
import { cn } from '@/lib/utils';

interface LineItemRowProps {
  index: number;
  line: {
    glAccount: string;
    fund: string;
    bankAccount: string;
    description: string;
    amount: number;
  };
  isFirstLine: boolean;
  glAccounts: GLAccount[];
  onLineChange: (index: number, field: string, value: string | number) => void;
  onRemoveLine: (index: number) => void;
  showPreview?: boolean;
}

export const LineItemRow: React.FC<LineItemRowProps> = ({
  index,
  line,
  isFirstLine,
  glAccounts,
  onLineChange,
  onRemoveLine,
  showPreview = true,
}) => {
  return (
    <div className={cn(
      "relative space-y-4 p-4 rounded-lg border grid grid-cols-12 gap-4",
      isFirstLine ? "bg-gray-50 border-gray-200" : "bg-white border-blue-100"
    )}>
      <div className="col-span-1 flex items-center">
        {!isFirstLine && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => onRemoveLine(index)} 
                  className="h-5 w-5 px-0.5 mx-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove this line item</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="col-span-11 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">GL Account</Label>
            <Select 
              value={line.glAccount || "none"} 
              onValueChange={value => onLineChange(index, 'glAccount', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select GL Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select GL Account</SelectItem>
                {glAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Fund</Label>
            <Select 
              value={line.fund} 
              onValueChange={value => onLineChange(index, 'fund', value)}
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
              onValueChange={value => onLineChange(index, 'bankAccount', value)}
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
              onChange={e => onLineChange(index, 'description', e.target.value)} 
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
              onChange={e => onLineChange(index, 'amount', parseFloat(e.target.value) || 0)} 
              placeholder="0.00" 
              className="mt-2 text-right" 
              step="0.01" 
              disabled={isFirstLine} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
