
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSupabaseQuery } from '@/hooks/supabase';

interface InvoiceLineItem {
  id?: string;
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

interface InvoiceLineItemsProps {
  lines: InvoiceLineItem[];
  onLinesChange: (lines: InvoiceLineItem[]) => void;
  associationId?: string;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  lines,
  onLinesChange,
  associationId
}) => {
  const { data: glAccounts = [] } = useSupabaseQuery(
    'gl_accounts',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
    },
    !!associationId
  );

  const { data: bankAccounts = [] } = useSupabaseQuery(
    'bank_accounts',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
    },
    !!associationId
  );

  const updateLine = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };
    onLinesChange(updatedLines);
  };

  const addLine = () => {
    onLinesChange([
      ...lines,
      {
        glAccount: '',
        fund: '',
        bankAccount: '',
        description: '',
        amount: 0,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button size="sm" onClick={addLine} className="gap-1">
          <Plus className="h-4 w-4" /> New Line Item
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">GL Account</TableHead>
              <TableHead className="w-[180px]">Fund</TableHead>
              <TableHead className="w-[180px]">Bank Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px] text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={line.id || index}>
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
                          {account.account_number} - {account.name}
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
                      <SelectItem value="operating">Operating Fund</SelectItem>
                      <SelectItem value="reserve">Reserve Fund</SelectItem>
                      <SelectItem value="special">Special Assessment</SelectItem>
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
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
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
    </div>
  );
};
