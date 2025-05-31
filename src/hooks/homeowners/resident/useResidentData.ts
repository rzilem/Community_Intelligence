
import { useState, useEffect } from 'react';
import { Homeowner } from '@/components/homeowners/detail/types';
import { toast } from 'sonner';
import { mockHomeowners } from '@/pages/homeowners/homeowner-data';
import { supabase } from '@/integrations/supabase/client';
import { convertDbResidentToHomeowner } from './residentUtils';

export const useResidentData = (residentId: string) => {
  const [resident, setResident] = useState<Homeowner>({
    id: '',
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    property: '',
    unit: '',
    balance: 0,
    tags: [],
    violations: [],
    lastContact: {
      called: '',
      visit: '',
      email: ''
    },
    status: '',
    avatarUrl: '',
    notes: [],
    propertyImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResident = async () => {
      setLoading(true);
      try {
        // First, try to fetch resident data from the database
        const { data: residentData, error: residentError } = await supabase
          .from('residents')
          .select(`
            *,
            properties!property_id (
              id, 
              address, 
              unit_number, 
              city, 
              state, 
              zip_code
            )
          `)
          .eq('id', residentId)
          .single();

        if (residentError) {
          console.warn(`Error fetching resident data: ${residentError.message}`);
          
          // Check if the homeowner exists in the mockHomeowners data as fallback
          const foundHomeowner = mockHomeowners.find(h => h.id === residentId);
          
          if (foundHomeowner) {
            // Convert the mockHomeowners data to match Homeowner type
            const convertedHomeowner = convertDbResidentToHomeowner(foundHomeowner);
            setResident(convertedHomeowner);
          } else {
            console.warn(`Homeowner with id ${residentId} not found, using empty data`);
            // If not found in mock data either, just use the ID
            setResident(prevState => ({...prevState, id: residentId}));
          }
        } else if (residentData) {
          // Get user profile data in a separate query if needed
          let profileData = null;
          if (residentData.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', residentData.user_id)
              .single();
              
            if (!userError) {
              profileData = userData;
            }
          }
          
          // Build the homeowner object from the database data
          const property = residentData.properties;
          const propertyAddress = property ? 
            `${property.address || ''} ${property.unit_number || ''}`.trim() : '';
          
          let fullName = residentData.name || '';
          if (!fullName && profileData) {
            fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          }
          
          const email = residentData.email || (profileData?.email || '');
          const phone = residentData.phone || (profileData?.phone_number || '');
          const avatarUrl = profileData?.profile_image_url || '';
          
          const convertedHomeowner: Homeowner = {
            id: residentData.id,
            name: fullName,
            email: email,
            phone: phone,
            moveInDate: residentData.move_in_date || '',
            moveOutDate: residentData.move_out_date || '',
            property: propertyAddress,
            propertyId: residentData.property_id || '',
            unit: property?.unit_number || '',
            balance: 0, // Would need to fetch from assessments table
            tags: [],
            violations: [], // Would need to fetch from compliance_issues table
            lastContact: {
              called: '',
              visit: '',
              email: ''
            },
            status: residentData.move_out_date ? 'inactive' : 'active',
            avatarUrl: avatarUrl,
            propertyImage: '', // Property images would need to be handled separately
            notes: [],
            type: residentData.resident_type as any, // Use 'any' to avoid type error
            propertyAddress: propertyAddress,
            association: '', // Would need to join with association table
            closingDate: ''
          };
          
          setResident(convertedHomeowner);
          console.log('Loaded homeowner data from database:', convertedHomeowner);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homeowner data:", err);
        setError('Failed to fetch homeowner data');
        setLoading(false);
      }
    };

    if (residentId) {
      fetchResident();
    }
  }, [residentId]);

  const updateResidentData = async (updatedData: Partial<Homeowner>) => {
    try {
      // For residents table, we'll update the data in the database
      if (resident.id) {
        const updateData: any = {};
        
        // Map the homeowner fields to resident fields
        if (updatedData.name) updateData.name = updatedData.name;
        if (updatedData.email) updateData.email = updatedData.email;
        if (updatedData.phone) updateData.phone = updatedData.phone;
        if (updatedData.moveInDate) updateData.move_in_date = updatedData.moveInDate;
        if (updatedData.moveOutDate) updateData.move_out_date = updatedData.moveOutDate;
        if (updatedData.type) updateData.resident_type = updatedData.type;
        
        // Update in database
        const { error } = await supabase
          .from('residents')
          .update(updateData)
          .eq('id', resident.id);
          
        if (error) {
          console.error("Error updating resident in database:", error);
          throw new Error('Failed to update resident data in database');
        }
      }
      
      // Update local state
      setResident(prev => ({
        ...prev,
        ...updatedData
      }));
      
      return true;
    } catch (err) {
      console.error("Error updating homeowner data:", err);
      throw new Error('Failed to update homeowner data');
    }
  };

  return {
    resident,
    loading,
    error,
    updateResidentData
  };
};
