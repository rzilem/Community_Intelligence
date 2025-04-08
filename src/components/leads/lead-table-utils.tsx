
import React from 'react';
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';

export const renderLeadTableCell = (lead: Lead, columnId: string, columns: Array<{ id: string; label: string; accessorKey?: string }>) => {
  const column = columns.find(col => col.id === columnId);
  
  if (!column || !column.accessorKey) return null;
  
  const value = lead[column.accessorKey as keyof Lead];
  
  if (column.id === 'status' && value) {
    return <LeadStatusBadge status={value as Lead['status']} />;
  }
  
  if (column.id === 'created_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }
  
  if (column.id === 'updated_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value as React.ReactNode;
};
