
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface InvoiceStatusBadgeProps {
  status: string;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'paid':
      return <Badge className="bg-blue-500">Paid</Badge>;
    case 'scheduled':
      return <Badge className="bg-amber-500">Payment Scheduled</Badge>;
    case 'processing':
      return <Badge className="bg-purple-500">Payment Processing</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

export default InvoiceStatusBadge;
