
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

interface InvoiceStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'paid';
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case 'paid':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          Paid
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default InvoiceStatusBadge;
