
import React from 'react';
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import LeadStatusBadge from './LeadStatusBadge';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { ExternalLink } from 'lucide-react';

// Format a name properly (First Last)
const formatName = (lead: Lead): string => {
  // Check if first_name and last_name are available
  if (lead.first_name || lead.last_name) {
    return [lead.first_name, lead.last_name].filter(Boolean).join(' ');
  }
  
  // Fall back to the name field
  if (lead.name && lead.name !== "Lead Contact" && lead.name !== "Unknown Contact") {
    // Remove "of Association" if present
    const cleanName = lead.name.replace(/of\s+Association/i, '').trim();
    
    // Don't use email usernames as names
    if (cleanName.includes('@') || /^[a-zA-Z0-9._%+-]+$/.test(cleanName)) {
      // This looks like an email username, not a real name
      return '';
    }
    
    // Split into words and capitalize each word
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return '';
};

// Extract and clean city name
const extractCity = (cityField: string | undefined, address: string | undefined): string => {
  // If we have a city field directly, clean and use it
  if (cityField) {
    // Fix specific issues with city names
    if (cityField === 'TrailAuin') {
      return 'Austin';
    }
    return cleanCityName(cityField);
  }
  
  if (!address) return '';
  
  // Try to extract city with common patterns
  const cityPattern = /(?:,\s*|\s+)([A-Za-z\s.]+?)(?:,\s*|\s+)(?:[A-Z]{2}|[A-Za-z\s]+)\s+\d{5}/;
  const match = address.match(cityPattern);
  
  if (match && match[1]) {
    return cleanCityName(match[1].trim());
  }
  
  // Look for common Texas cities
  const commonTexasCities = [
    'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 
    'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 
    'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'McKinney', 'Frisco', 
    'Pasadena', 'Killeen', 'Waco', 'Denton', 'New Braunfels', 'Round Rock', 
    'Dripping Springs', 'Colorado Springs'
  ];
  
  for (const city of commonTexasCities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  // Special case for TrailAustin variants
  if (address.includes('Trail') && (address.includes('Austin') || address.includes('Auin'))) {
    return 'Austin';
  }
  
  return '';
};

// Helper function to clean up city names by removing street-related words and prefixes
const cleanCityName = (city: string): string => {
  if (!city) return '';
  
  // Special case fix for 'TrailAuin' to 'Austin'
  if (city === 'TrailAuin') {
    return 'Austin';
  }
  
  // Remove any numeric prefixes (like "pug", "rippy", etc.)
  const cleanedCity = city
    .replace(/^\s*([a-zA-Z0-9]+\s+)+/i, '')
    // Remove street-related words
    .replace(/\d+|Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Circle|Cir\.?|Boulevard|Blvd\.?|Highway|Hwy\.?|Way|Place|Pl\.?|Terrace|Ter\.?|Parkway|Pkwy\.?|Alley|Aly\.?|Creek|Loop|Prairie|Clover|pug|rippy|St(?=[A-Z])|Trail|Forest|[\d\s]+[A-Z][a-z]*(?=\s)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Handle special case for "Colorado StAustin" -> "Austin"
  if (cleanedCity.includes('StAustin')) {
    return 'Austin';
  }
  
  // Handle special cases for "TrailAuin" and similar
  if (cleanedCity === 'Auin') {
    return 'Austin';
  }
  
  return cleanedCity;
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
  if (columnId === 'name') {
    return formatName(lead);
  }
  
  if (columnId === 'city') {
    // Extract and clean the city name
    return extractCity(lead.city, lead.street_address);
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
