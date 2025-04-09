
import React from 'react';
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { ExternalLink } from 'lucide-react';

// Format a name properly (First Last)
const formatName = (name: string): string => {
  if (!name) return '';
  
  // Remove "of Association" if present
  const cleanName = name.replace(/of\s+Association/i, '').trim();
  
  // Split into words and capitalize each word
  return cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Extract just the city from an address string
const extractCity = (address: string | undefined): string => {
  if (!address) return '';
  
  // Try to extract city with common patterns
  const cityPattern = /(?:,\s*|\s+)([A-Za-z\s.]+?)(?:,\s*|\s+)(?:[A-Z]{2}|[A-Za-z\s]+)\s+\d{5}/;
  const match = address.match(cityPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Look for common Texas cities
  const commonTexasCities = [
    'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
    'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville',
    'McKinney', 'Frisco', 'Pasadena', 'Killeen', 'Waco', 'Denton', 'New Braunfels', 'Round Rock'
  ];
  
  for (const city of commonTexasCities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  return '';
};

// Create a Google Maps link from an address
const createGoogleMapsLink = (address: string | undefined): string => {
  if (!address) return '#';
  
  // Clean up the address by removing "Map It" and similar phrases
  const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
  
  // URL encode the address for Google Maps
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
};

export const renderLeadTableCell = (lead: Lead, columnId: string, columns: LeadColumn[]) => {
  const column = columns.find(col => col.id === columnId);
  
  if (!column || !column.accessorKey) return null;
  
  const accessorKey = column.accessorKey;
  
  // Get the value from the lead object using the accessorKey
  const value = lead[accessorKey as keyof Lead];
  
  // Special formatting for specific columns
  if (columnId === 'name' && value) {
    return formatName(value as string);
  }
  
  if (columnId === 'city' && lead.street_address) {
    return extractCity(lead.street_address);
  }
  
  if (columnId === 'street_address' && value) {
    const address = value as string;
    const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
    const mapsLink = createGoogleMapsLink(address);
    
    return (
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

  // Return value as string or React node
  return value as React.ReactNode;
};
