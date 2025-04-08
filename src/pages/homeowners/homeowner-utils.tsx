
import React from 'react';
import { Homeowner } from './homeowner-types';
import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: Homeowner['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'inactive':
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactive</Badge>;
    case 'pending-approval':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const getHomeownerTypeBadge = (type: Homeowner['type']) => {
  switch (type) {
    case 'owner':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Owner</Badge>;
    case 'tenant':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Tenant</Badge>;
    case 'family-member':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">Family Member</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const formatCurrency = (amount?: number) => {
  if (amount === undefined) return '-';
  return amount === 0 ? '$0.00' : `$${amount.toFixed(2)}`;
};

export const formatPaymentInfo = (amount?: number, date?: string) => {
  if (!amount && !date) return '-';
  if (amount === 0) return '$0.00';
  return `${formatCurrency(amount)} on ${formatDate(date || '')}`;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};
