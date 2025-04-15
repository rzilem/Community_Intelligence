
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
      
      // First get user's associations
      const { data: userAssociations, error: associationsError } = await supabase
        .rpc('get_user_associations');
          
      if (associationsError) {
        console.error('Error fetching user associations:', associationsError);
        toast.error('Failed to load associations');
        setLoading(false);
        return;
      }
      
      // If there's no error but also no data, fetch directly from associations table
      if (!userAssociations || userAssociations.length === 0) {
        const { data: directAssociations, error: directError } = await supabase
          .from('associations')
          .select('id, name')
          .eq('is_archived', false)
          .order('name');
        
        if (directError) {
          console.error('Error fetching associations directly:', directError);
          toast.error('Failed to load associations');
          setLoading(false);
          return;
        }
        
        setAssociations(directAssociations || []);
      } else {
        setAssociations(userAssociations || []);
      }
      
      const associationIds = associations.map(a => a.id);
      console.log('User has access to associations:', associationIds);
      
      if (associationIds.length === 0) {
        console.log('No associations found for user');
        setLoading(false);
        return;
      }
      
      // Then get properties for these associations
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('association_id', associationIds);
        
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        toast.error('Failed to load properties');
        setLoading(false);
        return;
      }
      
      if (!properties || properties.length === 0) {
        console.log('No properties found for associations:', associationIds);
        setLoading(false);
        return;
      }
      
      // Get all residents for these properties
      const propertyIds = properties.map(p => p.id);
      
      // Fetch all residents directly using a JOIN query
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
      
      // Create association name lookup
      const associationsMap = associations.reduce((map, assoc) => {
        map[assoc.id] = assoc.name;
        return map;
      }, {});
      
      // Map the results with validated associations
      const allResidents = (residentsData || []).map(resident => {
        const property = resident.properties;
        const associationId = property?.association_id;
        const hasValidAssociation = associationId && associationsMap[associationId];
        
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
          association: associationId || '',
          associationName: hasValidAssociation ? associationsMap[associationId] : 'Unknown Association',
          hasValidAssociation: !!hasValidAssociation,
          balance: 0, // We'll add real data later
        };
      });
      
      // Log statistics about valid/invalid associations
      const validCount = allResidents.filter(r => r.hasValidAssociation).length;
      const invalidCount = allResidents.length - validCount;
      
      if (invalidCount > 0) {
        console.warn(`Found ${invalidCount} residents with invalid or missing associations`);
      }
      
      setResidents(allResidents);
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
