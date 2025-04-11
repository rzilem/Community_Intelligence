
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useResidentsData = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [associations, setAssociations] = useState<any[]>([]);
  const { currentAssociation } = useAuth();

  // Fetch residents from Supabase
  const fetchResidentsData = async () => {
    try {
      setLoading(true);
      
      // First get all properties for the user's associations
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*');
        
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        toast.error('Failed to load properties');
        setLoading(false);
        return;
      }
      
      if (!properties || properties.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get all residents for these properties
      const propertyIds = properties.map(p => p.id);
      
      // Fetch all residents directly using a JOIN query instead of separate queries
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select(`
          *,
          properties:property_id (
            id,
            address,
            unit_number,
            association_id
          )
        `)
        .in('property_id', propertyIds);
      
      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        toast.error('Failed to load residents');
        setLoading(false);
        return;
      }
      
      // Get associations to display proper names
      const { data: associationsData, error: associationsError } = await supabase
        .from('associations')
        .select('id, name');
        
      if (associationsError) {
        console.error('Error fetching associations:', associationsError);
      }
      
      const associationsMap = (associationsData || []).reduce((map, assoc) => {
        map[assoc.id] = assoc.name;
        return map;
      }, {});
      
      // Map the results
      const allResidents = (residentsData || []).map(resident => {
        const property = resident.properties;
        const associationId = property?.association_id || '';
        
        return {
          id: resident.id,
          name: resident.name || 'Unknown',
          email: resident.email || '',
          phone: resident.phone || '',
          propertyId: resident.property_id,
          propertyAddress: property ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` : 'Unknown',
          type: resident.resident_type,
          status: resident.move_out_date ? 'inactive' : 'active',
          moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
          moveOutDate: resident.move_out_date,
          association: associationId,
          associationName: associationsMap[associationId] || 'Unknown',
          balance: 0, // We'll add real data later
        };
      });
      
      setResidents(allResidents);
      
      // Fetch associations for filtering
      const { data: userAssociations, error: userAssociationsError } = await supabase
        .rpc('get_user_associations');
          
      if (userAssociationsError) {
        console.error('Error fetching user associations:', userAssociationsError);
      } else {
        setAssociations(userAssociations || []);
      }
    } catch (error) {
      console.error('Error loading residents:', error);
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchResidentsData();
  }, []);
  
  // Listen for real-time updates to residents
  useEffect(() => {
    const channel = supabase
      .channel('residents-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'residents'
      }, (payload) => {
        console.log('Realtime update detected:', payload);
        // Reload the residents when there's a change
        fetchResidentsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    residents,
    loading,
    associations,
    fetchResidentsData
  };
};
