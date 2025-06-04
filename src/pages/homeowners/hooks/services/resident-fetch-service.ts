
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResident, DatabaseProperty } from '../types/resident-types';

export class ResidentFetchService {
  
  async fetchPropertiesByAssociations(associationIds: string[]): Promise<DatabaseProperty[]> {
    if (associationIds.length === 0) return [];
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .in('association_id', associationIds);
      
    if (error) {
      throw new Error(`Failed to load properties: ${error.message}`);
    }
    
    return properties || [];
  }

  async fetchResidentsBatched(propertyIds: string[], batchSize = 500): Promise<DatabaseResident[]> {
    if (propertyIds.length === 0) return [];
    
    const allResidents: DatabaseResident[] = [];
    
    // Process in parallel batches for better performance
    const batches: Promise<DatabaseResident[]>[] = [];
    
    for (let i = 0; i < propertyIds.length; i += batchSize) {
      const batchIds = propertyIds.slice(i, i + batchSize);
      batches.push(this.fetchResidentBatch(batchIds));
    }
    
    const results = await Promise.all(batches);
    
    // Flatten results
    for (const batch of results) {
      allResidents.push(...batch);
    }
    
    return allResidents;
  }

  private async fetchResidentBatch(propertyIds: string[]): Promise<DatabaseResident[]> {
    const { data: residentsData, error } = await supabase
      .from('residents')
      .select('*')
      .in('property_id', propertyIds);
    
    if (error) {
      throw new Error(`Failed to load residents: ${error.message}`);
    }
    
    return residentsData || [];
  }
}

export const residentFetchService = new ResidentFetchService();
