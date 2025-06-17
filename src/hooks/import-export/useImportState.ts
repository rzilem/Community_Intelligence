import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ValidationResult, ImportResult } from '@/types/import-types';
import { dataImportService } from '@/services/import-export';
import { validationService } from '@/services/import-export/validation-service';
import { toast } from 'sonner';
import { useAssociationPropertyType } from './useAssociationPropertyType';

export function useImportState() {
  const { user, currentAssociation } = useAuth();
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importType, setImportType] = useState<string>('associations');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Get association property type for smart validation
  const { hasPropertyType } = useAssociationPropertyType(selectedAssociationId);
  
  // Set the current association as the selected association when available
  useEffect(() => {
    if (currentAssociation?.id && !selectedAssociationId) {
      setSelectedAssociationId(currentAssociation.id);
      console.log('Auto-selected association:', currentAssociation.id);
    }
  }, [currentAssociation, selectedAssociationId]);

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
  };

  const resetImportState = () => {
    setImportFile(null);
    setImportData([]);
    setImportType('');
    setValidationResults(null);
    setImportResults(null);
    setShowMappingModal(false);
  };

  const validateData = async (parsedData: any[], type: string) => {
    setIsValidating(true);
    
    try {
      if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
        toast.error('No valid data found to validate');
        return {
          valid: false,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          warnings: 0,
          issues: []
        };
      }
      
      toast.info(`Validating ${parsedData.length} rows of data...`);
      const results = await validationService.validateData(parsedData, type, selectedAssociationId);
      console.log('Validation results:', results);
      
      setValidationResults(results);
      
      if (results.valid) {
        toast.success(`File validated successfully with ${results.validRows} valid rows`);
      } else {
        toast.warning(`Found ${results.invalidRows} rows with issues out of ${results.totalRows} total rows`);
      }
      
      setShowMappingModal(true);
      return results;
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Failed to validate the uploaded data');
      
      // Set validation results to a failed state
      const errorResults = {
        valid: false,
        totalRows: parsedData?.length || 0,
        validRows: 0,
        invalidRows: parsedData?.length || 0,
        warnings: 0,
        issues: [{
          row: 0,
          field: 'general',
          issue: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
      
      setValidationResults(errorResults);
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const importDataWithMapping = async (mappings: Record<string, string>) => {
    console.log('Mapping confirmed:', mappings);
    setShowMappingModal(false);
    setIsImporting(true);
    
    // Validate that we have the required mappings
    const requiredMappings = getRequiredMappings(importType, selectedAssociationId);
    const mappedFields = Object.values(mappings);
    
    const missingMappings = requiredMappings.filter(field => !mappedFields.includes(field));
    
    if (missingMappings.length > 0) {
      toast.error(`Missing required field mappings: ${missingMappings.join(', ')}`);
      setIsImporting(false);
      setShowMappingModal(true);
      return;
    }
    
    try {
      if (!importData || importData.length === 0) {
        throw new Error('No data to import');
      }
      
      const results = await dataImportService.importData({
        associationId: selectedAssociationId,
        dataType: importType,
        data: importData,
        mappings,
        userId: user?.id
      });
      
      console.log('Import results:', results);
      setImportResults(results);
      
      if (results.success) {
        toast.success(`Successfully imported ${results.successfulImports} records`);
      } else {
        toast.warning(`Imported with issues: ${results.successfulImports} successful, ${results.failedImports} failed`);
      }
      
      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
      
      const errorResults = {
        success: false,
        totalProcessed: importData?.length || 0,
        successfulImports: 0,
        failedImports: importData?.length || 0,
        details: [
          { status: 'error' as const, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        ]
      };
      
      setImportResults(errorResults);
      return errorResults;
    } finally {
      setIsImporting(false);
    }
  };
  
  // Helper function to get required mappings based on import type
  const getRequiredMappings = (type: string, associationId: string): string[] => {
    const baseMappings = getBaseMappings(type, associationId);
    
    // Add association identifier requirement for "all associations" imports
    if (associationId === 'all' && type !== 'associations') {
      return [...baseMappings, 'association_identifier'];
    }
    
    return baseMappings;
  };

  const getBaseMappings = (type: string, associationId: string): string[] => {
    switch (type) {
      case 'properties':
        // For specific associations that have a property type, don't require property_type mapping
        if (associationId !== 'all' && hasPropertyType) {
          return ['address']; // Only require address, property_type will be auto-populated
        }
        return ['address', 'property_type'];
      case 'owners':
        return ['first_name', 'last_name', 'property_id'];
      case 'properties_owners':
        // For specific associations that have a property type, don't require property_type mapping
        if (associationId !== 'all' && hasPropertyType) {
          return ['address']; // Only require address, property_type will be auto-populated
        }
        return ['address', 'property_type'];
      case 'financial':
        return ['property_id', 'amount', 'due_date'];
      case 'compliance':
        return ['property_id', 'violation_type'];
      case 'maintenance':
        return ['property_id', 'title', 'description'];
      case 'associations':
        return ['name'];
      default:
        return [];
    }
  };

  return {
    selectedAssociationId,
    showMappingModal,
    validationResults,
    importResults,
    importFile,
    importData,
    importType,
    isValidating,
    isImporting,
    setShowMappingModal,
    setImportFile,
    setImportData,
    setImportType,
    handleAssociationChange,
    resetImportState,
    validateData,
    importDataWithMapping
  };
}
