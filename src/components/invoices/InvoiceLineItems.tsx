import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { GLAccount } from '@/types/accounting-types';

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
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);

  useEffect(() => {
    const fetchGLAccounts = async () => {
      let query = supabase
        .from('gl_accounts')
        .select('*')
        .order('code');

      if (associationId) {
        query = query.or(`association_id.is.null,association_id.eq.${associationId}`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching GL accounts:', error);
        return;
      }

      setGLAccounts(data || []);
    };

    fetchGLAccounts();
  }, [associationId]);

  const lineTotal = useMemo(() => 
    lines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0), 
    [lines]
  );

  const adjustedFirstLineAmount = useMemo(() => {
    return invoiceTotal - lineTotal;
  }, [invoiceTotal, lineTotal]);

  const handleAddLine = useCallback(() => {
    const { fund, bankAccount } = lines[0];
    
    onLinesChange([...lines, {
      glAccount: '',
      fund, 
      bankAccount,
      description: '',
      amount: 0
    }]);
  }, [lines, onLinesChange]);

  const handleLineChange = useCallback((index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'amount' && index > 0) {
      const lineTotal = newLines.slice(1).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
      newLines[0] = { ...newLines[0], amount: invoiceTotal - lineTotal };
    }

    onLinesChange(newLines);
  }, [lines, onLinesChange, invoiceTotal]);

  const handleRemoveLine = useCallback((index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      onLinesChange(newLines);
    }
  }, [lines, onLinesChange]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800">Line Items</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddLine} 
                className="flex items-center gap-2 text-green-600 hover:bg-green-50"
                disabled={lines.length >= 5}
              >
                <PlusCircle className="h-4 w-4" />
                Add Line
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {lines.length >= 5 
                ? "Maximum number of line items reached" 
                : "Add a new line item"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {lines.map((line, index) => (
        <div 
          key={index} 
          className={cn(
            "relative space-y-4 p-4 rounded-lg border grid grid-cols-12 gap-4",
            index === 0 ? "bg-gray-50 border-gray-200" : "bg-white border-blue-100"
          )}
        >
          <div className="col-span-1 flex items-center">
            {lines.length > 1 && index > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleRemoveLine(index)} 
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
                  onValueChange={value => handleLineChange(index, 'glAccount', value)}
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
                  onValueChange={value => handleLineChange(index, 'fund', value)}
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
                  onValueChange={value => handleLineChange(index, 'bankAccount', value)}
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
                  onChange={e => handleLineChange(index, 'description', e.target.value)} 
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
                  onChange={e => handleLineChange(index, 'amount', parseFloat(e.target.value) || 0)} 
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

      {Math.abs(lineTotal + (lines[0]?.amount || 0) - invoiceTotal) > 0.01 && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Line items do not match the total invoice amount</span>
        </div>
      )}
    </div>
  );
};

export default InvoiceLineItems;
