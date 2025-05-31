import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

export const useAmenities = () => {
  const { currentAssociation } = useAuth();
  
  // Query for amenities
  const { data: amenities, isLoading: amenitiesLoading } = useSupabaseQuery<any[]>(
    'amenities',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'association_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Generate amenity options for select dropdown
  const amenityOptions = amenitiesLoading 
    ? [{ id: '1', name: 'Loading...' }]
    : amenities && amenities.length > 0 
      ? amenities 
      : [
          { id: '1', name: 'Swimming Pool' },
          { id: '2', name: 'Tennis Court' },
          { id: '3', name: 'Community Center' },
          { id: '4', name: 'Gym' }
        ];
        
  return { amenityOptions, amenitiesLoading };
};
