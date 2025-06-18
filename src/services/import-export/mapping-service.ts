
import { supabase } from '@/integrations/supabase/client';

export const mappingService = {
  saveImportMapping: async (
    associationId: string,
    importType: string,
    mappings: Record<string, string>,
    userId?: string
  ): Promise<void> => {
    try {
      const { data: existingMapping } = await supabase
        .from('import_mappings')
        .select('*')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (existingMapping) {
        await supabase
          .from('import_mappings')
          .update({ mappings: mappings as any })
          .eq('id', existingMapping.id);
      } else {
        await supabase
          .from('import_mappings')
          .insert({
            association_id: associationId,
            import_type: importType,
            mappings: mappings as any,
            created_by: userId
          } as any);
      }
    } catch (error) {
      console.error('Error saving import mappings:', error);
    }
  },
  
  getImportMapping: async (
    associationId: string,
    importType: string
  ): Promise<Record<string, string> | null> => {
    try {
      const { data, error } = await supabase
        .from('import_mappings')
        .select('mappings')
        .eq('association_id', associationId)
        .eq('import_type', importType)
        .maybeSingle();
      
      if (error) {
        console.error('Error getting import mappings:', error);
        return null;
      }
      
      return data?.mappings && typeof data.mappings === 'object' 
        ? (data.mappings as unknown as Record<string, string>)
        : null;
    } catch (error) {
      console.error('Error getting import mappings:', error);
      return null;
    }
  },
};
