
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoicePaymentAlertProps {
  show: boolean;
  onViewPaymentsQueue: () => void;
}

const InvoicePaymentAlert: React.FC<InvoicePaymentAlertProps> = ({ show, onViewPaymentsQueue }) => {
  if (!show) return null;
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Approved Invoices Ready for Payment</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span className="text-amber-700">
          Some approved invoices are ready to be scheduled for payment.
        </span>
        <Button 
          variant="outline" 
          className="border-amber-500 text-amber-600"
          onClick={onViewPaymentsQueue}
        >
          View Payment Queue
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default InvoicePaymentAlert;
