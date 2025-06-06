
import { supabase } from '@/integrations/supabase/client';
import { ExportOptions } from './import-export/types';

export const dataExportService = {
  exportData: async (options: ExportOptions) => {
    const { associationId, dataType, format } = options;
    
    try {
      let tableName: string;
      let query: any = supabase;
      
      switch (dataType) {
        case 'associations':
          tableName = 'associations';
          query = query.from(tableName as any).select('*');
          break;
        case 'properties_owners':
          // This will need a more complex query to join properties and residents
          const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .select('*, residents(*)')
            .eq('association_id', associationId);
          
          if (propertiesError) throw propertiesError;
          return {
            success: true,
            message: 'Properties and owners exported successfully',
            fileName: `properties_owners_export.${format}`,
            data: properties
          };
        case 'financial':
          tableName = 'assessments';
          query = query.from(tableName as any)
            .select('*, properties:property_id(address, unit_number)')
            .eq('properties.association_id', associationId);
          break;
        case 'compliance':
          tableName = 'compliance_issues';
          query = query.from(tableName as any).select('*').eq('association_id', associationId);
          break;
        case 'maintenance':
          tableName = 'maintenance_requests';
          query = query.from(tableName as any)
            .select('*, properties:property_id(address, unit_number, association_id)')
            .eq('properties.association_id', associationId);
          break;
        case 'vendors':
          tableName = 'vendors';
          query = query.from(tableName as any).select('*');
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      // Only execute the query if we're not handling a special case like properties_owners
      // which has already been processed and returned above
      const { data: exportData, error } = await query;
      
      if (error) {
        console.error(`Error exporting ${dataType} data:`, error);
        throw error;
      }
      
      return {
        success: true,
        message: `${dataType} data exported successfully in ${format} format`,
        fileName: `${dataType}_export.${format}`,
        data: exportData
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
  
  getExportTemplate: async (templateType: string) => {
    console.log(`Would generate template for ${templateType}`);
    
    return {
      success: true,
      message: `${templateType} template generated successfully`,
      fileName: `${templateType.toLowerCase()}_template.xlsx`
    };
  }
};
