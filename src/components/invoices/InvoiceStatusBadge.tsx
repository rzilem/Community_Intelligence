
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
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

export default InvoiceStatusBadge;
