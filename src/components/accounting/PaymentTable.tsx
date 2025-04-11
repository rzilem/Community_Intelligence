
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Payment } from '@/types/transaction-payment-types';
import { getStatusBadge, getMethodBadge } from './PaymentStatusBadges';

interface PaymentTableProps {
  payments: Payment[];
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                No payments found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.vendor}</TableCell>
                <TableCell>{payment.associationName}</TableCell>
                <TableCell>{payment.category}</TableCell>
                <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                <TableCell>{getMethodBadge(payment.method)}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipButton size="sm" variant="ghost" tooltip="View payment details">
                      View
                    </TooltipButton>
                    {payment.status === 'scheduled' && (
                      <TooltipButton size="sm" variant="outline" className="border-amber-500 text-amber-500" tooltip="Edit payment details">
                        Edit
                      </TooltipButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentTable;
