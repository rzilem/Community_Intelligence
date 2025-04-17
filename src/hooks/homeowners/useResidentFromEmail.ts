
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
      email = filteredEmails.length > 0 ? filteredEmails[0] : null;
      
      if (email) {
        console.log('Found usable email in HTML content:', email);
      }
    }
  }
  
  // Query resident data if we found an email
  const { data: residents = [] } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id, email',
      filter: email ? [{ column: 'email', value: email }] : undefined,
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
