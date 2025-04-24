
import React from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import TooltipButton from '@/components/ui/tooltip-button';
import { TransactionTableProps } from '@/types/transaction-payment-types';

interface ExtendedTransactionTableProps extends TransactionTableProps {
  selectedTransactions: string[];
  onSelectionChange: (selected: string[]) => void;
}

const TransactionTable: React.FC<ExtendedTransactionTableProps> = ({ 
  transactions, 
  selectedTransactions, 
  onSelectionChange 
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(transactions.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTransactions, id]);
    } else {
      onSelectionChange(selectedTransactions.filter(t => t !== id));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={transactions.length > 0 && selectedTransactions.length === transactions.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>GL Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.property}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>{transaction.glAccount}</TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <TooltipButton
                    size="icon"
                    variant="ghost"
                    tooltip="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </TooltipButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
