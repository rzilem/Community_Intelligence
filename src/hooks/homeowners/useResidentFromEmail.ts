
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

export const useResidentFromEmail = (htmlContent: string | undefined, directEmail?: string | null) => {
  // First prioritize a direct email if provided, then attempt to extract from HTML content
  let email = directEmail || null;
  
  // Extract email from HTML content using regex only if no direct email was provided
  if (!email && htmlContent) {
    // Improved email regex for better matching
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatches = htmlContent.match(emailRegex);
    
    // Use the first email match if found
    if (emailMatches && emailMatches.length > 0) {
      email = emailMatches[0];
      console.log('Extracted email from HTML content:', email);
    }
  }
  
  // Query resident data if we found an email
  const { data: residents = [] } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id, email',
      filter: [{ column: 'email', value: email }],
    },
    !!email
  );

  // Get the first resident if any exist
  const resident = residents && residents.length > 0 ? residents[0] : null;

  // Query property data if we found a resident
  const { data: property } = useSupabaseQuery(
    'properties',
    {
      select: 'address, unit_number',
      filter: [{ column: 'id', value: resident?.property_id }],
      single: true
    },
    !!resident?.property_id
  );

  return { resident, property, email };
};
