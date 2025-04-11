
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
      try {
        const savedMappings = await dataImportService.getImportMapping(associationId, importType);
        if (savedMappings) {
          setMappings(savedMappings);
        }
      } catch (error) {
        console.error("Error loading saved mappings:", error);
      }
    };
    
    if (associationId && importType) {
      loadSavedMappings();
    }
  }, [associationId, importType, setMappings]);
  
  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };

  const handleConfirm = () => {
    onConfirm(mappings);
  };

  // Ensure we have valid arrays
  const safeFileColumns = Array.isArray(fileColumns) ? fileColumns : [];
  const safeSystemFields = Array.isArray(systemFields) ? systemFields : [];
  const safePreviewData = Array.isArray(previewData) ? previewData : [];

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
            fileColumns={safeFileColumns} 
            previewData={safePreviewData} 
            totalRows={Array.isArray(fileData) ? fileData.length : 0} 
          />
          
          {/* Column Mappings */}
          <ColumnMappingList 
            fileColumns={safeFileColumns}
            systemFields={safeSystemFields}
            mappings={mappings}
            onMappingChange={handleMappingChange}
            previewData={safePreviewData}
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
