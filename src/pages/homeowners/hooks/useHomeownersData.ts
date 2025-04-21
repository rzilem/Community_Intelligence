
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useHomeownersData = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

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

  // More efficient data fetching with direct property join
  const fetchResidentsByAssociationId = async (associationId: string | null = null, page = 1, pageSize = 25) => {
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
        setTotalCount(0);
        return;
      }

      // First get the total count - FIX: Use a more reliable count query
      const countQuery = supabase
        .from('residents')
        .select('id', { count: 'exact' })
        .in('properties.association_id', associationIds);
      
      // We need to add the join condition to the count query
      const { count, error: countError } = await countQuery
        .select(`
          id,
          properties:property_id (
            association_id
          )
        `, { count: 'exact', head: false });

      if (countError) {
        console.error('Error fetching resident count:', countError);
        setError('Failed to load count: ' + countError.message);
        setTotalCount(0);
      } else {
        console.log('Total resident count:', count);
        setTotalCount(count || 0);
      }
      
      // Direct join with properties and limiting results with pagination
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
        .in('properties.association_id', associationIds)
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        setError('Failed to load residents: ' + residentsError.message);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${residentsData?.length || 0} residents for page ${page}`);
      
      // Create association name lookup
      const associationsMap = associations.reduce((map: any, assoc: any) => {
        map[assoc.id] = assoc.name;
        return map;
      }, {});
      
      // Map the results
      const formattedResidents = (residentsData || []).map(resident => {
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
      
      setResidents(formattedResidents);
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
    setError,
    totalCount
  };
};
