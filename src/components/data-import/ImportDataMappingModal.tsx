
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
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
  const [hasAllRequiredMappings, setHasAllRequiredMappings] = useState(false);
  
  // Define required fields based on import type
  const getRequiredFields = () => {
    switch (importType) {
      case 'properties':
        return ['address', 'property_type'];
      case 'owners':
        return ['property_id', 'first_name', 'last_name'];
      case 'properties_owners':
        return ['address', 'property_type'];
      case 'financial':
        return ['property_id', 'amount', 'due_date'];
      case 'compliance':
        return ['property_id', 'violation_type'];
      case 'maintenance':
        return ['property_id', 'title', 'description'];
      default:
        return [];
    }
  };
  
  // Check if all required fields are mapped
  useEffect(() => {
    if (!mappings) {
      setHasAllRequiredMappings(false);
      return;
    }

    const requiredFields = getRequiredFields();
    const mappedFields = Object.values(mappings);
    
    // For properties_owners, we have a special case
    if (importType === 'properties_owners') {
      const requiredPropertyFields = ['address', 'property_type'].every(field => 
        mappedFields.includes(field) || mappedFields.includes(`property.${field}`)
      );
      
      const requiredOwnerFields = ['first_name', 'last_name'].some(field => 
        mappedFields.includes(field) || mappedFields.includes(`owner.${field}`)
      );
      
      setHasAllRequiredMappings(requiredPropertyFields && (fileColumns.length === 0 || requiredOwnerFields));
    } else {
      // For other import types
      const allRequiredFieldsMapped = requiredFields.every(field => {
        return mappedFields.includes(field);
      });
      
      setHasAllRequiredMappings(allRequiredFieldsMapped || requiredFields.length === 0);
    }
  }, [mappings, importType, fileColumns.length]);
  
  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };
  
  const handleConfirm = () => {
    onConfirm(mappings);
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
            <AlertTitle>Validation Issues</AlertTitle>
            <AlertDescription>
              Your data has {validationResults.invalidRows || 0} issues that should be reviewed.
            </AlertDescription>
          </Alert>
        )}
        
        {!hasAllRequiredMappings && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Required Mappings</AlertTitle>
            <AlertDescription>
              Please map all required fields for {importType}: {getRequiredFields().join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
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
            disabled={!hasAllRequiredMappings}
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
