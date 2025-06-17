
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Info } from 'lucide-react';
import ColumnMappingList from './ColumnMappingList';
import DataPreviewTable from './DataPreviewTable';
import ValidationResultsSummary from './ValidationResultsSummary';
import { ValidationResult } from '@/types/import-types';
import { useMappingFields } from './useMappingFields';

interface ImportDataMappingModalProps {
  importType: string;
  fileData: any[];
  associationId: string;
  validationResults?: ValidationResult | null;
  onClose: () => void;
  onConfirm: (mappings: Record<string, string>) => void;
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  importType,
  fileData = [],
  associationId,
  validationResults,
  onClose,
  onConfirm
}) => {
  const {
    fileColumns,
    systemFields,
    mappings,
    setMappings,
    previewData
  } = useMappingFields(importType, fileData, associationId);
  
  const [activeTab, setActiveTab] = useState('mapping');
  const [hasMinimumMappings, setHasMinimumMappings] = useState(false);
  
  // Define minimum required fields based on import type
  const getMinimumRequiredFields = () => {
    switch (importType) {
      case 'properties':
        return ['address']; // Only address is truly required, property_type will default to 'residential'
      case 'owners':
        return ['property_id']; // Need to link to a property
      case 'properties_owners':
        return ['address']; // Only address is required for combined import
      case 'financial':
        return ['amount'];
      case 'compliance':
        return ['violation_type'];
      case 'maintenance':
        return ['title'];
      default:
        return [];
    }
  };
  
  // Check if minimum required fields are mapped
  useEffect(() => {
    if (!mappings) {
      setHasMinimumMappings(false);
      return;
    }

    const minimumFields = getMinimumRequiredFields();
    const mappedFields = Object.values(mappings).filter(field => field && field.trim() !== '');
    
    if (minimumFields.length === 0) {
      setHasMinimumMappings(true);
      return;
    }
    
    // For properties_owners, we just need address mapped
    if (importType === 'properties_owners') {
      const hasAddress = mappedFields.some(field => 
        field === 'address' || field === 'Property Address'
      );
      setHasMinimumMappings(hasAddress);
    } else {
      // For other import types, check if minimum fields are mapped
      const hasMinimumFields = minimumFields.every(field => 
        mappedFields.includes(field)
      );
      setHasMinimumMappings(hasMinimumFields);
    }
  }, [mappings, importType]);
  
  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };
  
  const handleConfirm = () => {
    onConfirm(mappings);
  };

  const getMappedFieldsCount = () => {
    return Object.values(mappings).filter(field => field && field.trim() !== '').length;
  };

  const getValidationMessage = () => {
    if (importType === 'properties_owners') {
      const hasAddress = Object.values(mappings).some(field => 
        field === 'address' || field === 'Property Address'
      );
      if (!hasAddress) {
        return "Please map a column to 'Property Address' to proceed with the import.";
      }
      return `Ready to import! ${getMappedFieldsCount()} fields mapped. Property type will default to 'residential' if not specified.`;
    }
    
    const minimumFields = getMinimumRequiredFields();
    if (minimumFields.length === 0) {
      return `Ready to import! ${getMappedFieldsCount()} fields mapped.`;
    }
    
    if (!hasMinimumMappings) {
      return `Please map the required fields: ${minimumFields.join(', ')}`;
    }
    
    return `Ready to import! ${getMappedFieldsCount()} fields mapped.`;
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Your Data</DialogTitle>
        </DialogHeader>
        
        {importType && (
          <div className="mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Selected Import Type:</div>
            <div className="bg-muted p-2 rounded-md inline-block font-medium">
              {importType.charAt(0).toUpperCase() + importType.slice(1).replace('_', ' & ')}
            </div>
          </div>
        )}
        
        {validationResults && !validationResults.valid && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Validation Issues</AlertTitle>
            <AlertDescription>
              Your file has {validationResults.invalidRows || 0} rows with validation issues. 
              These will be reported during import but won't prevent the import from proceeding.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert variant={hasMinimumMappings ? "default" : "destructive"} className="mb-4">
          {hasMinimumMappings ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>Field Mapping Status</AlertTitle>
          <AlertDescription>
            {getValidationMessage()}
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapping" className="space-y-4 pt-4">
            <ColumnMappingList
              fileColumns={fileColumns}
              systemFields={systemFields}
              mappings={mappings}
              onMappingChange={handleMappingChange}
              previewData={previewData}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <ValidationResultsSummary validationResults={validationResults} className="mb-4" />
            
            <div className="border rounded-md overflow-hidden">
              <DataPreviewTable
                data={previewData.slice(0, 5)}
                highlightedColumns={Object.keys(mappings)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!hasMinimumMappings}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            Confirm & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataMappingModal;
