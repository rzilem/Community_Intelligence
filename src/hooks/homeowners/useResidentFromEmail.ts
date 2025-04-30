
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

export const useResidentFromEmail = (htmlContent: string | undefined, directEmail?: string | null) => {
  // First prioritize a direct email if provided, then attempt to extract from HTML content
  let email = directEmail || null;
  
  // Only try to extract from HTML if no direct email was provided
  if (!email && htmlContent) {
    // Check for typical email formats in the HTML content
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatches = htmlContent.match(emailRegex);
    
    if (emailMatches && emailMatches.length > 0) {
      // Filter out common system emails we don't want
      const filteredEmails = emailMatches.filter(e => 
        !e.toLowerCase().includes('psmanagement@psprop.net') && 
        !e.toLowerCase().includes('noreply') && 
        !e.toLowerCase().includes('no-reply'));
      
      // Use the first filtered email, or if none are left, use the first email found
      email = filteredEmails.length > 0 ? filteredEmails[0] : emailMatches[0];
      
      if (email) {
        console.log('Found usable email in HTML content:', email);
      }
    }
  }
  
  // First, try exact email match
  const { data: residents = [] } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id, email',
      filter: email ? [{ column: 'email', value: email }] : undefined,
    },
    !!email
  );

  // If no resident found with exact match, try case-insensitive match
  const { data: caseInsensitiveResidents = [] } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id, email',
      filter: (email && residents.length === 0) ? [{ column: 'email', operator: 'ilike', value: `%${email}%` }] : undefined,
    },
    !!(email && residents.length === 0)
  );

  // Combine results, prioritizing exact matches
  const allResidents = [...residents, ...caseInsensitiveResidents];
  
  // Get the first resident if any exist
  const resident = allResidents && allResidents.length > 0 ? allResidents[0] : null;

  // Query property data if we found a resident
  const { data: property } = useSupabaseQuery(
    'properties',
    {
      select: 'id, address, unit_number, association_id',
      filter: [{ column: 'id', value: resident?.property_id }],
      single: true
    },
    !!resident?.property_id
  );
  
  // Also fetch association data if we have a property
  const { data: association } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: property?.association_id ? [{ column: 'id', value: property.association_id }] : undefined,
      single: true
    },
    !!property?.association_id
  );

  return { 
    resident, 
    property, 
    email,
    association 
  };
};
