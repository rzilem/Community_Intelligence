
import { supabase } from '@/integrations/supabase/client';
import { PropertyUI } from '@/types/property-types';
import { devLog } from '@/utils/dev-logger';

export const propertyService = {
  async getPropertiesByAssociation(associationId: string): Promise<PropertyUI[]> {
    try {
      devLog.info(`[PropertyService] Fetching properties for association: ${associationId}`);

      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          *,
          residents!inner(
            id,
            first_name,
            last_name,
            is_primary
          ),
          associations!inner(
            id,
            name
          )
        `)
        .eq('association_id', associationId)
        .order('address');

      if (error) {
        devLog.error('[PropertyService] Error fetching properties:', error);
        throw error;
      }

      devLog.info(`[PropertyService] Found ${properties?.length || 0} properties`);

      return (properties || []).map(property => ({
        id: property.id,
        address: property.address,
        city: property.city || '',
        state: property.state || '',
        zip: property.zip || '',
        type: (property.property_type as PropertyUI['type']) || 'single_family',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        sqFt: property.square_footage || 0,
        association: property.associations?.name || 'Unknown',
        associationId: property.association_id,
        status: this.determinePropertyStatus(property),
        ownerName: this.getPrimaryOwnerName(property.residents)
      }));
    } catch (error) {
      devLog.error('[PropertyService] Error in getPropertiesByAssociation:', error);
      throw error;
    }
  },

  determinePropertyStatus(property: any): PropertyUI['status'] {
    // Simple status determination logic
    if (property.residents && property.residents.length > 0) {
      return 'occupied';
    }
    return 'vacant';
  },

  getPrimaryOwnerName(residents: any[]): string | undefined {
    if (!residents || residents.length === 0) return undefined;
    
    const primaryResident = residents.find(r => r.is_primary) || residents[0];
    if (!primaryResident) return undefined;
    
    return `${primaryResident.first_name || ''} ${primaryResident.last_name || ''}`.trim();
  },

  async searchProperties(associationId: string, searchTerm: string): Promise<PropertyUI[]> {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          *,
          residents(
            id,
            first_name,
            last_name,
            is_primary
          ),
          associations(
            id,
            name
          )
        `)
        .eq('association_id', associationId)
        .or(`address.ilike.%${searchTerm}%,unit_number.ilike.%${searchTerm}%`)
        .order('address');

      if (error) throw error;

      return (properties || []).map(property => ({
        id: property.id,
        address: property.address,
        city: property.city || '',
        state: property.state || '',
        zip: property.zip || '',
        type: (property.property_type as PropertyUI['type']) || 'single_family',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        sqFt: property.square_footage || 0,
        association: property.associations?.name || 'Unknown',
        associationId: property.association_id,
        status: this.determinePropertyStatus(property),
        ownerName: this.getPrimaryOwnerName(property.residents)
      }));
    } catch (error) {
      devLog.error('[PropertyService] Error in searchProperties:', error);
      throw error;
    }
  }
};
