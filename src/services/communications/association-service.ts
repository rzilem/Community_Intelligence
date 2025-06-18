
import { supabase } from '@/integrations/supabase/client';
import { Association } from '@/types/association-types';
import { devLog } from '@/utils/dev-logger';

export const associationService = {
  // Get all associations the user has access to
  getAllAssociations: async (): Promise<Association[]> => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Error fetching associations:', error);
      return [];
    }
  },
  
  // Get a specific association by ID
  getAssociationById: async (associationId: string): Promise<Association | null> => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .eq('id', associationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error(`Error fetching association with ID ${associationId}:`, error);
      return null;
    }
  }
};
