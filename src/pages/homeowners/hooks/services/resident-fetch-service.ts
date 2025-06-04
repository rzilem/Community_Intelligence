
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResident, DatabaseProperty } from '../types/resident-types';

export class ResidentFetchService {
  
  async fetchPropertiesByAssociations(associationIds: string[]): Promise<DatabaseProperty[]> {
    if (associationIds.length === 0) return [];
    
    // Use hoa_id instead of association_id to match actual schema
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('hoa_id', associationIds);
      
    if (error) {
      throw new Error(`Failed to load properties: ${error.message}`);
    }
    
    // Direct type assertion without complex returns<> typing
    return (data || []) as DatabaseProperty[];
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
    // Remove complex type assertion that was causing TS2589
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .in('property_id', propertyIds);
    
    if (error) {
      throw new Error(`Failed to load residents: ${error.message}`);
    }
    
    // Direct type assertion without complex inference
    return (data || []) as DatabaseResident[];
  }
}

export const residentFetchService = new ResidentFetchService();
