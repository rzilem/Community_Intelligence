
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { dataImportService } from '@/services/import-export';
import { useMappingFields } from './useMappingFields';
import ValidationResultsSummary from './ValidationResultsSummary';
import DataPreviewTable from './DataPreviewTable';
import ColumnMappingList from './ColumnMappingList';
import { ValidationSummary } from './types/mapping-types';

interface ImportDataMappingModalProps {
  importType: string;
  fileData: any[];
  associationId: string;
  onClose: () => void;
  onConfirm: (mappings: Record<string, string>) => void;
  validationResults?: ValidationSummary;
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  importType,
  fileData,
  associationId,
  onClose,
  onConfirm,
  validationResults
}) => {
  const { 
    fileColumns, 
    systemFields, 
    mappings, 
    setMappings, 
    previewData 
  } = useMappingFields(importType, fileData, associationId);
  
  useEffect(() => {
    // Load saved mappings if available
    const loadSavedMappings = async () => {
      const savedMappings = await dataImportService.getImportMapping(associationId, importType);
      if (savedMappings) {
        setMappings(savedMappings);
      }
    };
    
    loadSavedMappings();
  }, [associationId, importType]);
  
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
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Map Import Columns</DialogTitle>
          <DialogDescription>
            Match columns from your file to the corresponding system fields.
            Unmapped columns will be ignored during import.
          </DialogDescription>
        </DialogHeader>
        
        {validationResults && (
          <ValidationResultsSummary validationResults={validationResults} />
        )}
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {/* Data Preview */}
          <DataPreviewTable 
            fileColumns={fileColumns} 
            previewData={previewData} 
            totalRows={fileData.length} 
          />
          
          {/* Column Mappings */}
          <ColumnMappingList 
            fileColumns={fileColumns}
            systemFields={systemFields}
            mappings={mappings}
            onMappingChange={handleMappingChange}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm and Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataMappingModal;
