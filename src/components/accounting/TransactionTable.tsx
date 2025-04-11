
import React from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';
import { TransactionTableProps } from '@/types/transaction-payment-types';

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
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
