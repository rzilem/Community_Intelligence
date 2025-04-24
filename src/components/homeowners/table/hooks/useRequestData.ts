
import { useEffect } from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { useResidentFromEmail } from '@/hooks/homeowners/useResidentFromEmail';

export const useRequestData = (request: HomeownerRequest, onEditRequest?: (request: HomeownerRequest) => void) => {
  const senderEmail = extractPrimarySenderEmail(request);
  
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'name',
      filter: [{ column: 'id', value: request.association_id }],
      single: true
    },
    !!request.association_id
  );

  const { resident, property, email, association: residentAssociation } = useResidentFromEmail(
    request.html_content,
    senderEmail
  );

  useEffect(() => {
    const shouldUpdateRequest = (
      resident && 
      property && 
      (!request.resident_id || !request.property_id || !request.association_id)
    );
    
    if (shouldUpdateRequest && onEditRequest) {
      console.log('Resident info found that could update request:', {
        resident_id: resident.id,
        property_id: property.id,
        association_id: property.association_id
      });
    }
  }, [resident, property, request, onEditRequest]);

  return {
    association,
    resident,
    property,
    email,
    residentAssociation,
    senderEmail
  };
};

function extractPrimarySenderEmail(request: HomeownerRequest): string | null {
  if (request.html_content) {
    const pspropMatch = request.html_content.match(/([a-zA-Z0-9._-]+@psprop\.net)/i);
    if (pspropMatch) {
      console.log('Found psprop.net email:', pspropMatch[0]);
      return pspropMatch[0];
    }
  }
  
  if (request.tracking_number && request.tracking_number.includes('rickyz@psprop.net')) {
    console.log('Found rickyz@psprop.net in tracking number');
    return 'rickyz@psprop.net';
  }
  
  if (request.html_content) {
    const fromHeaderMatch = request.html_content.match(/From:\s*([^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i);
    if (fromHeaderMatch && fromHeaderMatch[2]) {
      console.log('Found email in From header:', fromHeaderMatch[2]);
      return fromHeaderMatch[2];
    }
  }
  
  if (request.tracking_number) {
    const emailMatch = request.tracking_number.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch) {
      console.log('Found email in tracking number:', emailMatch[1]);
      return emailMatch[1];
    }
  }
  
  if (request.html_content) {
    const emailPatterns = [
      /Reply-To:\s*(?:[^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /Reply-To:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /Return-Path:\s*<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /envelope-from\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /email=([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
    ];
    
    for (const pattern of emailPatterns) {
      const match = request.html_content.match(pattern);
      if (match && match[1]) {
        console.log('Found email using pattern:', pattern, match[1]);
        return match[1];
      }
    }
  }
  
  return null;
}
