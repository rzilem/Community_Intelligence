
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/types/transaction-payment-types';

export const getStatusBadge = (status: Payment['status']) => {
  switch (status) {
    case 'processed':
      return <Badge className="bg-green-500">Processed</Badge>;
    case 'scheduled':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

export const getMethodBadge = (method: Payment['method']) => {
  switch (method) {
    case 'ach':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">ACH</Badge>;
    case 'check':
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Check</Badge>;
    case 'credit':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Credit Card</Badge>;
    case 'wire':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-500">Wire</Badge>;
    default:
      return <Badge variant="outline">Other</Badge>;
  }
};
