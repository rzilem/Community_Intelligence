
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

export const useResidentFromEmail = (htmlContent: string | undefined) => {
  // Extract email from HTML content using regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = htmlContent?.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : null;

  // Query resident data if we found an email, but don't use single: true to avoid errors
  const { data: residents = [] } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id',
      filter: [{ column: 'email', value: email }],
      // Remove single: true to get all matching residents
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
