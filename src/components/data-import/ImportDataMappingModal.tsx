
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ValidationResult } from '@/types/import-types';
import ColumnMappingList from './ColumnMappingList';
import DataPreviewTable from './DataPreviewTable';
import ValidationResultsSummary from './ValidationResultsSummary';
import AssociationIdentifierHelper from './AssociationIdentifierHelper';
import { useMappingFields } from './useMappingFields';

interface ImportDataMappingModalProps {
  importType: string;
  fileData: any[];
  associationId: string;
  validationResults?: ValidationResult;
  onClose: () => void;
  onConfirm: (mappings: Record<string, string>) => void;
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  importType,
  fileData,
  associationId,
  validationResults,
  onClose,
  onConfirm
}) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const isMultiAssociation = associationId === 'all';
  
  // Get available mapping fields and file data using the hook
  const {
    fileColumns,
    systemFields,
    previewData
  } = useMappingFields(importType, fileData, associationId);
  
  // Add association identifier field for multi-association imports
  let availableFields = [...systemFields];
  if (isMultiAssociation && importType !== 'associations') {
    availableFields = [
      { label: 'Association Identifier', value: 'association_identifier' },
      ...systemFields
    ];
  }

  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };

  const handleConfirm = () => {
    // Validate required mappings for multi-association imports
    if (isMultiAssociation && importType !== 'associations') {
      const hasAssociationMapping = Object.values(mappings).includes('association_identifier');
      if (!hasAssociationMapping) {
        toast.error('Association Identifier mapping is required for multi-association imports');
        return;
      }
    }
    
    // Check for duplicate mappings
    const mappedFields = Object.values(mappings).filter(field => field);
    const uniqueFields = new Set(mappedFields);
    
    if (mappedFields.length !== uniqueFields.size) {
      toast.error('Each field can only be mapped once. Please check for duplicate mappings.');
      return;
    }
    
    // Check for required field mappings
    const requiredFields = getRequiredFields(importType, isMultiAssociation);
    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      toast.error(`Missing required field mappings: ${missingFields.join(', ')}`);
      return;
    }
    
    onConfirm(mappings);
  };

  const getRequiredFields = (type: string, multiAssoc: boolean): string[] => {
    const baseRequired = {
      properties: ['address', 'property_type'],
      owners: ['first_name', 'last_name'],
      properties_owners: ['address'],
      financial: ['amount', 'due_date'],
      compliance: ['violation_type'],
      maintenance: ['title', 'description'],
      associations: ['name'],
    }[type] || [];
    
    if (multiAssoc && type !== 'associations') {
      return [...baseRequired, 'association_identifier'];
    }
    
    return baseRequired;
  };

  const requiredFields = getRequiredFields(importType, isMultiAssociation);
  const mappedFields = Object.values(mappings).filter(field => field);
  const missingRequiredFields = requiredFields.filter(field => !mappedFields.includes(field));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Map Import Fields - {importType.replace('_', ' ').toUpperCase()}
            {isMultiAssociation && <Badge className="ml-2">Multi-Association</Badge>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left side - Column mapping */}
          <div className="flex-1 flex flex-col min-h-0">
            <AssociationIdentifierHelper
              isMultiAssociation={isMultiAssociation}
              fileColumns={fileColumns}
              mappings={mappings}
            />
            
            {validationResults && (
              <div className="mb-4">
                <ValidationResultsSummary validationResults={validationResults} />
              </div>
            )}
            
            <div className="flex-1 min-h-0">
              <ColumnMappingList
                fileColumns={fileColumns}
                systemFields={availableFields}
                mappings={mappings}
                onMappingChange={handleMappingChange}
                previewData={previewData}
              />
            </div>
          </div>
          
          {/* Right side - Data preview */}
          <div className="w-1/2 flex flex-col min-h-0">
            <h3 className="font-medium mb-2">Data Preview</h3>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full border rounded">
                <DataPreviewTable 
                  data={fileData.slice(0, 10)} 
                />
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            {missingRequiredFields.length > 0 && (
              <Badge variant="destructive">
                Missing: {missingRequiredFields.join(', ')}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={missingRequiredFields.length > 0}
            >
              Import Data
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataMappingModal;
