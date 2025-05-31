
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DatabaseProperty {
  id: string;
  address: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  association_id?: string;
  unit_number?: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseResident {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  move_in_date?: string;
  move_out_date?: string;
  property_id?: string;
}

interface FormattedResident {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  type: string;
  status: string;
  moveInDate: string;
  moveOutDate?: string;
  association: string;
  associationName: string;
  lastPayment: null;
  closingDate: null;
  hasValidAssociation: boolean;
}

/**
 * Fetches resident data in batches to avoid "URL too long" errors
 * @param propertyIds Array of property IDs to fetch residents for
 * @param batchSize Maximum number of property IDs to include in a single query
 * @returns Combined array of resident data from all batches
 */
const fetchResidentsBatched = async (propertyIds: string[], batchSize = 500): Promise<DatabaseResident[]> => {
  let allResidents: DatabaseResident[] = [];
  
  for (let i = 0; i < propertyIds.length; i += batchSize) {
    const batchIds = propertyIds.slice(i, i + batchSize);
    console.log(`Fetching batch ${Math.floor(i/batchSize) + 1} with ${batchIds.length} properties`);
    
    const { data: residentsData, error: residentsError } = await supabase
      .from('residents')
      .select('*')
      .in('property_id', batchIds);
    
    if (residentsError) {
      console.error('Error fetching residents batch:', residentsError);
      throw new Error('Failed to load residents: ' + residentsError.message);
    }
    
    if (residentsData) {
      allResidents = [...allResidents, ...residentsData];
    }
  }
  
  return allResidents;
};

export const useHomeownersData = () => {
  const [residents, setResidents] = useState<FormattedResident[]>([]);
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
      const propertyIds = properties.map((p: DatabaseProperty) => p.id);
      
      // Fetch all residents for these properties - in batches to avoid URL too long errors
      console.log(`Fetching residents for ${propertyIds.length} properties`);
      
      try {
        // Use the extracted batched fetching function
        const allResidents = await fetchResidentsBatched(propertyIds);
        
        console.log(`Found ${allResidents.length || 0} residents in total`);
        
        // Create association name lookup
        const associationsMap: Record<string, string> = {};
        associations.forEach((assoc: any) => {
          associationsMap[assoc.id] = assoc.name;
        });

        // Create properties lookup
        const propertiesMap: Record<string, DatabaseProperty> = {};
        properties.forEach((prop: DatabaseProperty) => {
          propertiesMap[prop.id] = prop;
        });
        
        // Map the results with explicit typing
        const formattedResidents: FormattedResident[] = allResidents.map((resident: DatabaseResident) => {
          const property = resident.property_id ? propertiesMap[resident.property_id] : null;
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
            hasValidAssociation: !!associationsMap[associationId || '']
          };
        });
        
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
    associations,
    isLoadingAssociations,
    fetchResidentsByAssociationId,
    setError
  };
};
