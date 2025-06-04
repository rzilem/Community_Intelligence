
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResident, DatabaseProperty } from '../types/resident-types';

// Define explicit return types to avoid TS2589 error
interface PropertyFetchResult {
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

interface ResidentFetchResult {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  move_in_date?: string;
  move_out_date?: string;
  property_id?: string;
}

export class ResidentFetchService {
  
  async fetchPropertiesByAssociations(associationIds: string[]): Promise<DatabaseProperty[]> {
    if (associationIds.length === 0) return [];
    
    // Use explicit type assertion to avoid deep type inference
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('association_id', associationIds)
      .returns<PropertyFetchResult[]>();
      
    if (error) {
      throw new Error(`Failed to load properties: ${error.message}`);
    }
    
    // Map to our expected type
    return (data || []).map(prop => ({
      id: prop.id,
      address: prop.address,
      address_line_2: prop.address_line_2,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zip_code,
      property_type: prop.property_type,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      square_footage: prop.square_footage,
      association_id: prop.association_id,
      unit_number: prop.unit_number,
      created_at: prop.created_at,
      updated_at: prop.updated_at
    }));
  }

  async fetchResidentsBatched(propertyIds: string[], batchSize: number = 1000): Promise<DatabaseResident[]> {
    if (propertyIds.length === 0) return [];
    
    const allResidents: DatabaseResident[] = [];
    
    // Process in smaller sequential batches to avoid overwhelming the database
    for (let i = 0; i < propertyIds.length; i += batchSize) {
      const batchIds = propertyIds.slice(i, i + batchSize);
      const batchResidents = await this.fetchResidentBatch(batchIds);
      allResidents.push(...batchResidents);
      
      // Small delay between batches to prevent rate limiting
      if (i + batchSize < propertyIds.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return allResidents;
  }

  private async fetchResidentBatch(propertyIds: string[]): Promise<DatabaseResident[]> {
    // Use explicit type assertion to avoid TS2589 error
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .in('property_id', propertyIds)
      .returns<ResidentFetchResult[]>();
    
    if (error) {
      throw new Error(`Failed to load residents: ${error.message}`);
    }
    
    // Map to our expected type
    return (data || []).map(resident => ({
      id: resident.id,
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      resident_type: resident.resident_type,
      move_in_date: resident.move_in_date,
      move_out_date: resident.move_out_date,
      property_id: resident.property_id
    }));
  }
}

export const residentFetchService = new ResidentFetchService();
