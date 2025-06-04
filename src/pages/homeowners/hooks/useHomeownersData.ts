
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormattedResident, AssociationData } from './types';
import { fetchResidentsBatched } from './residentBatchService';
import { formatResidentsData } from './residentDataFormatter';

export const useHomeownersData = () => {
  const [residents, setResidents] = useState<FormattedResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch associations from Supabase with explicit typing
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
        associationIds = associations.map((a: AssociationData) => a.id);
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
      const propertyIds = properties.map((p: any) => p.id);
      
      // Fetch all residents for these properties - in batches to avoid URL too long errors
      console.log(`Fetching residents for ${propertyIds.length} properties`);
      
      try {
        const allResidents = await fetchResidentsBatched(propertyIds);
        
        console.log(`Found ${allResidents.length || 0} residents in total`);
        
        // Format the residents data
        const formattedResidents = formatResidentsData(allResidents, properties, associations as AssociationData[]);
        
        console.log('Formatted residents:', formattedResidents);
        setResidents(formattedResidents);
      } catch (batchError: any) {
        console.error('Error in batched fetching:', batchError);
        setError('Error fetching resident data: ' + batchError.message);
        toast.error('Failed to load residents');
      }
      
    } catch (error: any) {
      console.error('Error loading residents:', error);
      setError('Failed to load residents data: ' + (error?.message || 'Unknown error'));
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  return {
    residents,
    loading,
    error,
    associations: associations as AssociationData[],
    isLoadingAssociations,
    fetchResidentsByAssociationId,
    setError
  };
};
