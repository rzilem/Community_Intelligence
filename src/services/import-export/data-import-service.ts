import { ImportJob, ImportResult } from '@/types/import-types';
import { ImportOptions } from './types';
import { jobService } from './job-service';
import { mappingService } from './mapping-service';
import { templateService } from './template-service';
import { processorService } from './processor-service';

export const dataImportService = {
  createImportJob: jobService.createImportJob,
  updateImportJobStatus: jobService.updateImportJobStatus,
  getImportJob: jobService.getImportJob,
  getRecentImportJobs: jobService.getRecentImportJobs,
  
  saveImportMapping: mappingService.saveImportMapping,
  getImportMapping: mappingService.getImportMapping,
  
  getImportTemplate: templateService.getImportTemplate,
  
  importData: async (options: ImportOptions): Promise<ImportResult> => {
    const { associationId, dataType, data, mappings, userId } = options;
    
    try {
      // Handle multi-association imports
      if (associationId === 'all') {
        return await processMultiAssociationImport(dataType, data, mappings, userId);
      }
      
      // Special handling for properties_owners import type
      if (dataType === 'properties_owners') {
        return await processPropertiesOwnersImport(associationId, data, mappings, userId);
      }
      
      const importJob = await jobService.createImportJob({
        associationId,
        importType: dataType,
        fileName: `${dataType}_import_${new Date().toISOString()}`,
        fileSize: JSON.stringify(data).length,
        userId
      });
      
      if (!importJob) {
        return createFailureResult('Failed to create import job', 0);
      }
      
      const processedData = processDataMappings(data, mappings, dataType, associationId);
      
      const importResult = await processorService.processImportData(
        importJob.id,
        associationId,
        dataType,
        processedData
      );
      
      await mappingService.saveImportMapping(
        associationId,
        dataType,
        mappings,
        userId
      );
      
      const finalStatus = importResult.failedImports === 0 ? 'completed' : 'failed';
      await jobService.updateImportJobStatus(importJob.id, finalStatus as ImportJob['status'], {
        processed: processedData.length,
        succeeded: importResult.successfulImports,
        failed: importResult.failedImports,
        errorDetails: importResult.failedImports > 0 ? { details: importResult.details } : undefined
      });
      
      return {
        success: importResult.failedImports === 0,
        totalProcessed: processedData.length,
        successfulImports: importResult.successfulImports,
        failedImports: importResult.failedImports,
        job_id: importJob.id,
        details: importResult.details
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return createFailureResult(
        `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data.length
      );
    }
  }
};

// Helper function to create failure results
function createFailureResult(message: string, totalProcessed: number): ImportResult {
  return {
    success: false,
    totalProcessed,
    successfulImports: 0,
    failedImports: totalProcessed,
    details: [{ status: 'error' as const, message }]
  };
}

// Helper function to process data mappings
function processDataMappings(
  data: Record<string, any>[],
  mappings: Record<string, string>,
  dataType: string,
  associationId: string
): Record<string, any>[] {
  return data.map(row => {
    const mappedRow: Record<string, any> = {};
    
    // Only add association_id for non-association imports and when not "all"
    if (dataType !== 'associations' && associationId !== 'all') {
      mappedRow.association_id = associationId;
    }
    
    // Map fields from the source data to destination fields
    Object.entries(mappings).forEach(([column, field]) => {
      if (field && row[column] !== undefined) {
        mappedRow[field] = row[column];
      }
    });
    
    return mappedRow;
  });
}

// Helper function to process multi-association imports
async function processMultiAssociationImport(
  dataType: string,
  data: Record<string, any>[],
  mappings: Record<string, string>,
  userId?: string
): Promise<ImportResult> {
  try {
    // Get all associations for lookup
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: associations, error } = await (supabase as any)
      .from('associations')
      .select('id, name, code');
    
    if (error) {
      throw new Error(`Failed to fetch associations: ${error.message}`);
    }
    
    // Group data by association
    const associationGroups = new Map<string, any[]>();
    const unmatchedRows: any[] = [];
    
    data.forEach((row, index) => {
      const associationIdentifier = getAssociationIdentifier(row, mappings);
      
      if (!associationIdentifier) {
        unmatchedRows.push({ ...row, originalIndex: index });
        return;
      }
      
      // Find matching association
      const matchingAssociation = associations?.find(assoc => 
        assoc.id === associationIdentifier ||
        assoc.name?.toLowerCase() === associationIdentifier.toLowerCase() ||
        assoc.code?.toLowerCase() === associationIdentifier.toLowerCase()
      );
      
      if (!matchingAssociation) {
        unmatchedRows.push({ ...row, originalIndex: index, associationIdentifier });
        return;
      }
      
      if (!associationGroups.has(matchingAssociation.id)) {
        associationGroups.set(matchingAssociation.id, []);
      }
      
      associationGroups.get(matchingAssociation.id)!.push(row);
    });
    
    // Process each association group
    let totalSuccessful = 0;
    let totalFailed = unmatchedRows.length;
    const allDetails: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // Add errors for unmatched rows
    unmatchedRows.forEach(row => {
      allDetails.push({
        status: 'error',
        message: `Row ${row.originalIndex + 1}: Could not match association identifier "${row.associationIdentifier || 'missing'}"`
      });
    });
    
    // Process each association's data
    for (const [associationId, associationData] of associationGroups) {
      try {
        const result = await dataImportService.importData({
          associationId,
          dataType,
          data: associationData,
          mappings,
          userId
        });
        
        totalSuccessful += result.successfulImports;
        totalFailed += result.failedImports;
        
        const associationName = associations?.find(a => a.id === associationId)?.name || associationId;
        allDetails.push({
          status: 'success',
          message: `${associationName}: ${result.successfulImports} successful, ${result.failedImports} failed`
        });
        
        allDetails.push(...result.details);
      } catch (error) {
        const associationName = associations?.find(a => a.id === associationId)?.name || associationId;
        totalFailed += associationData.length;
        allDetails.push({
          status: 'error',
          message: `${associationName}: Failed to import ${associationData.length} records - ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return {
      success: totalFailed === 0,
      totalProcessed: data.length,
      successfulImports: totalSuccessful,
      failedImports: totalFailed,
      details: allDetails
    };
  } catch (error) {
    console.error('Error in multi-association import:', error);
    return createFailureResult(
      `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data.length
    );
  }
}

// Helper function to get association identifier from row
function getAssociationIdentifier(row: Record<string, any>, mappings: Record<string, string>): string | null {
  // Check if association_identifier is mapped
  const associationField = Object.entries(mappings).find(([_, field]) => field === 'association_identifier')?.[0];
  if (associationField && row[associationField]) {
    return String(row[associationField]).trim();
  }
  
  // Fallback to common association identifier fields
  const identifierFields = [
    'association_id', 'association_name', 'association_code',
    'hoa_id', 'hoa_name', 'Association ID', 'Association Name', 
    'Association Code', 'HOA ID', 'HOA Name'
  ];
  
  for (const field of identifierFields) {
    if (row[field]) {
      return String(row[field]).trim();
    }
  }
  
  return null;
}

// Helper function to process combined properties and owners import
async function processPropertiesOwnersImport(
  associationId: string,
  data: Record<string, any>[],
  mappings: Record<string, string>,
  userId?: string
): Promise<ImportResult> {
  try {
    const importJob = await jobService.createImportJob({
      associationId,
      importType: 'properties_owners',
      fileName: `properties_owners_import_${new Date().toISOString()}`,
      fileSize: JSON.stringify(data).length,
      userId
    });
    
    if (!importJob) {
      return createFailureResult('Failed to create import job', 0);
    }
    
    const processedRows = processPropertiesOwnersData(data, mappings, associationId);
    
    let successfulImports = 0;
    let failedImports = 0;
    const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
    
    // First, import all properties
    const propertyDataToImport = processedRows.map(row => row.propertyData);
    const propertyResult = await processorService.processImportData(
      importJob.id,
      associationId,
      'properties',
      propertyDataToImport
    );
    
    details.push(...propertyResult.details);
    
    // If properties were successfully imported, get their IDs and attach to owners
    if (propertyResult.successfulImports > 0) {
      const ownerResult = await processOwnersWithProperties(
        importJob.id,
        associationId,
        processedRows,
        propertyDataToImport
      );
      
      successfulImports = ownerResult.successfulImports;
      failedImports += ownerResult.failedImports;
      details.push(...ownerResult.details);
    } else {
      failedImports = data.length;
      details.push({
        status: 'error',
        message: 'Failed to import properties, cannot proceed with owner import'
      });
    }
    
    await mappingService.saveImportMapping(
      associationId,
      'properties_owners',
      mappings,
      userId
    );
    
    const finalStatus = failedImports === 0 ? 'completed' : 'failed';
    await jobService.updateImportJobStatus(importJob.id, finalStatus as ImportJob['status'], {
      processed: data.length,
      succeeded: successfulImports,
      failed: failedImports,
      errorDetails: failedImports > 0 ? { details } : undefined
    });
    
    return {
      success: failedImports === 0,
      totalProcessed: data.length,
      successfulImports,
      failedImports,
      job_id: importJob.id,
      details
    };
  } catch (error) {
    console.error('Error in combined import:', error);
    return createFailureResult(
      `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data.length
    );
  }
}

// Helper function to process properties and owners data
function processPropertiesOwnersData(
  data: Record<string, any>[],
  mappings: Record<string, string>,
  associationId: string
): Array<{ propertyData: Record<string, any>; ownerData: Record<string, any> }> {
  return data.map(row => {
    const propertyData: Record<string, any> = { association_id: associationId };
    const ownerData: Record<string, any> = { association_id: associationId };
    
    Object.entries(mappings).forEach(([column, field]) => {
      if (field && row[column] !== undefined) {
        if (field.startsWith('property.')) {
          propertyData[field.replace('property.', '')] = row[column];
        } else if (field.startsWith('owner.')) {
          ownerData[field.replace('owner.', '')] = row[column];
        }
      }
    });
    
    return { propertyData, ownerData };
  });
}

// Helper function to process owners with their properties
async function processOwnersWithProperties(
  jobId: string,
  associationId: string,
  processedRows: Array<{ propertyData: Record<string, any>; ownerData: Record<string, any> }>,
  propertyDataToImport: Record<string, any>[]
): Promise<{ successfulImports: number; failedImports: number; details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> }> {
  const { supabase } = await import('@/integrations/supabase/client');

  const { data } = await (supabase as any)
    .from('properties')
    .select('id, address, unit_number')
    .eq('association_id', associationId);

  const createdProperties = data as Array<{
    id: string;
    address: string;
    unit_number: string | null;
  }> | null;
  
  const ownerDataToImport = [];
  let failedImports = 0;
  const details: Array<{ status: 'success' | 'error' | 'warning'; message: string }> = [];
  
  for (let i = 0; i < processedRows.length; i++) {
    const { propertyData, ownerData } = processedRows[i];
    
    const matchingProperty = createdProperties?.find(p => 
      p.address === propertyData.address && 
      (p.unit_number === propertyData.unit_number || 
        (!p.unit_number && !propertyData.unit_number))
    );
    
    if (matchingProperty) {
      ownerData.property_id = matchingProperty.id;
      ownerData.resident_type = 'owner';
      ownerDataToImport.push(ownerData);
    } else {
      failedImports++;
      details.push({
        status: 'error',
        message: `Could not find matching property for address: ${propertyData.address} ${propertyData.unit_number || ''}`
      });
    }
  }
  
  let successfulImports = 0;
  
  if (ownerDataToImport.length > 0) {
    const ownerResult = await processorService.processImportData(
      jobId,
      associationId,
      'owners',
      ownerDataToImport
    );
    
    successfulImports = ownerResult.successfulImports;
    failedImports += ownerResult.failedImports;
    details.push(...ownerResult.details);
  }
  
  return { successfulImports, failedImports, details };
}
