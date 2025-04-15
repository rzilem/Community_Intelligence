
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useHomeownersData = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch associations from Supabase
  const { data: associations = [], isLoading: isLoadingAssociations, error: associationsError } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: [{ column: 'is_archived', operator: 'eq', value: false }],
      order: { column: 'name', ascending: true }
    }
  );

  useEffect(() => {
    if (associationsError) {
      console.error("Error loading associations:", associationsError);
      toast.error("Failed to load associations");
    }
  }, [associationsError]);

  const fetchResidentsByAssociationId = async (associationId: string | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get associations the user has access to
      let associationIds: string[] = [];
      
      if (!associationId || associationId === 'all') {
        associationIds = associations.map((a: any) => a.id);
        console.log('Fetching for all accessible associations:', associationIds);
      } else {
        associationIds = [associationId];
        console.log('Fetching for specific association:', associationId);
      }
      
      if (associationIds.length === 0) {
        console.log('No associations found for user');
        setLoading(false);
        setResidents([]);
        return;
      }
      
      // First, get all properties for these associations
      console.log('Fetching properties for associations:', associationIds);
      
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('association_id', associationIds);
        
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        setError('Failed to load properties: ' + propertiesError.message);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${properties?.length || 0} properties`);
      
      if (!properties || properties.length === 0) {
        console.log('No properties found for associations:', associationIds);
        setLoading(false);
        setResidents([]);
        return;
      }
      
      // Get all property IDs
      const propertyIds = properties.map(p => p.id);
      
      // Fetch all residents for these properties - in batches to avoid URL too long errors
      console.log(`Fetching residents for ${propertyIds.length} properties`);
      
      // If we have too many properties, let's fetch in smaller batches
      const BATCH_SIZE = 500;
      let allResidents: any[] = [];
      
      for (let i = 0; i < propertyIds.length; i += BATCH_SIZE) {
        const batchIds = propertyIds.slice(i, i + BATCH_SIZE);
        console.log(`Fetching batch ${i/BATCH_SIZE + 1} with ${batchIds.length} properties`);
        
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
          .in('property_id', batchIds);
        
        if (residentsError) {
          console.error('Error fetching residents batch:', residentsError);
          setError('Failed to load residents: ' + residentsError.message);
          setLoading(false);
          return;
        }
        
        if (residentsData) {
          allResidents = [...allResidents, ...residentsData];
        }
      }
      
      console.log(`Found ${allResidents.length || 0} residents in total`);
      
      // Create association name lookup
      const associationsMap = associations.reduce((map: any, assoc: any) => {
        map[assoc.id] = assoc.name;
        return map;
      }, {});
      
      // Map the results
      const formattedResidents = (allResidents || []).map(resident => {
        const property = resident.properties;
        const associationId = property?.association_id;
        
        return {
          id: resident.id,
          name: resident.name || 'Unknown',
          email: resident.email || '',
          phone: resident.phone || '',
          propertyAddress: property ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` : 'Unknown',
          type: resident.resident_type,
          status: resident.move_out_date ? 'inactive' : 'active',
          moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
          moveOutDate: resident.move_out_date,
          association: associationId || '',
          associationName: associationId && associationsMap[associationId] ? associationsMap[associationId] : 'Unknown Association',
          lastPayment: null,
          closingDate: null,
          hasValidAssociation: !!associationsMap[associationId]
        };
      });
      
      console.log('Formatted residents:', formattedResidents);
      setResidents(formattedResidents);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading residents:', error);
      setError('Failed to load residents data: ' + (error?.message || 'Unknown error'));
      toast.error('Failed to load residents');
      setLoading(false);
    }
  };

  return {
    residents,
    loading,
    error,
    associations,
    isLoadingAssociations,
    fetchResidentsByAssociationId,
    setError
  };
};

