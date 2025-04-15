
import { supabase } from '@/integrations/supabase/client';
import { jobService } from '../job-service';

export const financialProcessor = {
  process: async (jobId: string, associationId: string, processedData: Record<string, any>[]) => {
    await jobService.updateImportJobStatus(jobId, 'validating');
    
    const tableName = 'assessments';
    const batchSize = 25;
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // First, fetch or create assessment types for this association
    const assessmentTypeMap = await getOrCreateAssessmentTypes(associationId, processedData);
    
    // Prepare data for import
    const preparedData = processedData.map(row => {
      // Get the assessment type ID from our map using the name
      let assessmentTypeId = null;
      if (row.assessment_type && assessmentTypeMap[row.assessment_type]) {
        assessmentTypeId = assessmentTypeMap[row.assessment_type];
      }
      
      // Create a new object with only the fields that exist in the schema
      return {
        property_id: row.property_id,
        amount: row.amount,
        due_date: row.due_date,
        paid: row.paid || false,
        payment_date: row.payment_date,
        late_fee: row.late_fee,
        assessment_type_id: assessmentTypeId
      };
    });
    
    for (let i = 0; i < preparedData.length; i += batchSize) {
      const batch = preparedData.slice(i, i + batchSize);
      
      try {
        console.log(`Importing financial data batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
        
        if (!Array.isArray(batch) || batch.length === 0) {
          console.error('Empty or invalid batch data');
          failedImports += batch.length || 0;
          details.push({
            status: 'error',
            message: `Failed to import batch: Invalid data format`
          });
          continue;
        }
        
        const { data: insertedData, error } = await supabase
          .from(tableName as any)
          .insert(batch as any)
          .select('id');
        
        if (error) {
          console.error(`Error importing financial data:`, error);
          failedImports += batch.length;
          details.push({
            status: 'error',
            message: `Failed to import ${batch.length} records: ${error.message || 'Database error'}`
          });
        } else if (insertedData) {
          successfulImports += insertedData.length;
          details.push({
            status: 'success',
            message: `Imported ${insertedData.length} financial records successfully`
          });
        }
      } catch (e) {
        console.error(`Error in financial batch import:`, e);
        failedImports += batch.length;
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        details.push({
          status: 'error',
          message: `Failed to import ${batch.length} records: ${errorMessage}`
        });
      }
      
      await jobService.updateImportJobStatus(jobId, 'processing', {
        processed: i + batch.length,
        succeeded: successfulImports,
        failed: failedImports
      });
    }
    
    return {
      success: failedImports === 0,
      successfulImports,
      failedImports,
      details
    };
  }
};

// Helper function to get or create assessment types
async function getOrCreateAssessmentTypes(
  associationId: string, 
  data: Record<string, any>[]
): Promise<Record<string, string>> {
  try {
    // Extract unique assessment type names from the data
    const assessmentTypeNames = new Set<string>();
    data.forEach(row => {
      if (row.assessment_type && typeof row.assessment_type === 'string') {
        assessmentTypeNames.add(row.assessment_type);
      }
    });
    
    // If no assessment types found, return empty map
    if (assessmentTypeNames.size === 0) {
      return {};
    }
    
    // Fetch existing assessment types for this association
    const { data: existingTypes } = await supabase
      .from('assessment_types')
      .select('id, name')
      .eq('association_id', associationId);
    
    // Create a map of existing types
    const typeMap: Record<string, string> = {};
    if (existingTypes) {
      existingTypes.forEach((type: any) => {
        typeMap[type.name.toLowerCase()] = type.id;
      });
    }
    
    // Create new assessment types for any that don't exist
    const typesToCreate: Array<{ name: string, association_id: string }> = [];
    assessmentTypeNames.forEach(typeName => {
      if (!typeMap[typeName.toLowerCase()]) {
        typesToCreate.push({
          name: typeName,
          association_id: associationId
        });
      }
    });
    
    // If there are types to create, insert them
    if (typesToCreate.length > 0) {
      const { data: newTypes } = await supabase
        .from('assessment_types')
        .insert(typesToCreate)
        .select('id, name');
      
      // Add new types to the map
      if (newTypes) {
        newTypes.forEach((type: any) => {
          typeMap[type.name.toLowerCase()] = type.id;
        });
      }
    }
    
    return typeMap;
  } catch (error) {
    console.error('Error getting or creating assessment types:', error);
    return {};
  }
}
