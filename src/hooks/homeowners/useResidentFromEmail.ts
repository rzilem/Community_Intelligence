
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';

export const useResidentFromEmail = (htmlContent: string | undefined) => {
  // Extract email from HTML content using regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = htmlContent?.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : null;

  // Query resident data if we found an email
  const { data: resident } = useSupabaseQuery(
    'residents',
    {
      select: 'id, name, property_id',
      filter: [{ column: 'email', value: email }],
      single: true
    },
    !!email
  );

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
