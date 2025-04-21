
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Payment } from '@/types/transaction-payment-types';
import { getStatusBadge, getMethodBadge } from './PaymentStatusBadges';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentTableProps {
  payments: Payment[];
  onProcessPayment?: (paymentId: string) => void;
  onViewPayment?: (paymentId: string) => void;
  onEditPayment?: (paymentId: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ 
  payments, 
  onProcessPayment,
  onViewPayment,
  onEditPayment
}) => {
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
                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{getMethodBadge(payment.method)}</TableCell>
                <TableCell>{format(new Date(payment.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onViewPayment && (
                      <TooltipButton 
                        size="sm" 
                        variant="ghost" 
                        tooltip="View payment details"
                        onClick={() => onViewPayment(payment.id)}
                      >
                        View
                      </TooltipButton>
                    )}
                    
                    {payment.status === 'scheduled' && onEditPayment && (
                      <TooltipButton 
                        size="sm" 
                        variant="outline" 
                        className="border-amber-500 text-amber-500" 
                        tooltip="Edit payment details"
                        onClick={() => onEditPayment(payment.id)}
                      >
                        Edit
                      </TooltipButton>
                    )}
                    
                    {payment.status === 'scheduled' && onProcessPayment && (
                      <TooltipButton 
                        size="sm" 
                        variant="default" 
                        className="bg-green-500 hover:bg-green-600" 
                        tooltip="Process this payment"
                        onClick={() => onProcessPayment(payment.id)}
                      >
                        Process
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
