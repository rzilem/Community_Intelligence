
import React from 'react';
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { ExternalLink } from 'lucide-react';
import { formatLeadName } from './detail/lead-detail-utils';
import { extractCity, createGoogleMapsLink } from './detail/address-utils';
import AIBadge from '@/components/ui/ai-badge';

export const renderLeadTableCell = (lead: Lead, columnId: string, columns: LeadColumn[]) => {
  const column = columns.find(col => col.id === columnId);
  
  if (!column || !column.accessorKey) return null;
  
  const accessorKey = column.accessorKey;
  
  // Get the value from the lead object using the accessorKey
  const value = lead[accessorKey as keyof Lead];
  
  // Special formatting for specific columns
  if (columnId === 'name') {
    const content = formatLeadName(lead);
    const aiConf = lead.ai_confidence?.name;
    return (
      <span className="flex items-center gap-1">
        {content}
        {aiConf && <AIBadge confidence={aiConf} />}
      </span>
    );
  }
  
  if (columnId === 'city') {
    // Extract and clean the city name using the utility function
    const content = extractCity(lead.city, lead.street_address);
    const aiConf = lead.ai_confidence?.city;
    return (
      <span className="flex items-center gap-1">
        {content}
        {aiConf && <AIBadge confidence={aiConf} />}
      </span>
    );
  }
  
  if (columnId === 'street_address' && value) {
    const address = value as string;
    const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
    const mapsLink = createGoogleMapsLink(address);
    
    const cell = (
      <a
        href={mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-1"
      >
        {cleanAddress}
        <ExternalLink size={14} />
      </a>
    );
    const aiConf = lead.ai_confidence?.street_address;
    return (
      <span className="flex items-center gap-1">
        {cell}
        {aiConf && <AIBadge confidence={aiConf} />}
      </span>
    );
  }
  
  if (columnId === 'status' && value) {
    return <LeadStatusBadge status={value as Lead['status']} />;
  }
  
  if (columnId === 'created_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }
  
  if (columnId === 'updated_at' && value) {
    return formatDistanceToNow(new Date(value as string), { addSuffix: true });
  }

  if (columnId === 'number_of_units' && value !== undefined) {
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

  // Return value with AI badge if applicable
  const aiConf = lead.ai_confidence?.[accessorKey as string];
  return (
    <span className="flex items-center gap-1">
      {value as React.ReactNode}
      {aiConf && <AIBadge confidence={aiConf} />}
    </span>
  );
};
