
import React from 'react';
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';

export const renderLeadTableCell = (lead: Lead, columnId: string, columns: Array<{ id: string; label: string; accessorKey?: string }>) => {
  const column = columns.find(col => col.id === columnId);
  
  if (!column || !column.accessorKey) return null;
  
  const value = lead[column.accessorKey as keyof Lead];
  
  // Special formatting for specific columns
  if (column.id === 'status' && value) {
    return <LeadStatusBadge status={value as Lead['status']} />;
  }
  
  if (column.id === 'created_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }
  
  if (column.id === 'updated_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }

  if (column.id === 'number_of_units' && value !== undefined) {
    return Number(value).toString();
  }

  // Handle array or object values by converting to string
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  // If value is null or undefined, show a placeholder
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  // Return value as string or React node
  return value as React.ReactNode;
};
