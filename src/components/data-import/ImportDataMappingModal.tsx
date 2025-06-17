
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ValidationResult } from '@/types/import-types';
import ColumnMappingList from './ColumnMappingList';
import PropertyTypeAutoInfo from './PropertyTypeAutoInfo';
import PropertyTypeConfigurationAlert from './PropertyTypeConfigurationAlert';
import { useMappingFields } from './useMappingFields';

interface ImportDataMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: ValidationResult | null;
  fileData: any[];
  importType: string;
  associationId: string;
  associations?: any[];
  onConfirmMapping: (mappings: Record<string, string>) => void;
  isImporting: boolean;
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  open,
  onOpenChange,
  validationResults,
  fileData,
  importType,
  associationId,
  associations = [],
  onConfirmMapping,
  isImporting
}) => {
  const [mappings, setMappings] = React.useState<Record<string, string>>({});
  
  const { 
    fileColumns, 
    systemFields, 
    previewData, 
    associationPropertyType, 
    hasPropertyType 
  } = useMappingFields(importType, fileData, associationId);

  console.log('ImportDataMappingModal render:', {
    associationId,
    hasPropertyType,
    associationPropertyType,
    importType,
    systemFields: systemFields?.length || 0
  });

  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };

  const handleConfirmMapping = () => {
    onConfirmMapping(mappings);
  };

  // Get association info for the alert
  const selectedAssociation = associations.find(a => a.id === associationId);
  const showPropertyTypeAlert = selectedAssociation && 
    !hasPropertyType && 
    ['properties', 'properties_owners'].includes(importType) &&
    associationId !== 'all';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Data Columns</DialogTitle>
          <DialogDescription>
            Map your file columns to system fields. AI suggestions are provided to help with mapping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Results Summary */}
          {validationResults && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{validationResults.validRows} Valid</span>
              </div>
              {validationResults.invalidRows > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">{validationResults.invalidRows} Invalid</span>
                </div>
              )}
              {validationResults.warnings > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">{validationResults.warnings} Warnings</span>
                </div>
              )}
            </div>
          )}

          {/* Property Type Configuration Alert */}
          {showPropertyTypeAlert && (
            <PropertyTypeConfigurationAlert
              associationName={selectedAssociation.name}
              associationId={associationId}
              importType={importType}
            />
          )}

          {/* Property Type Auto Info */}
          <PropertyTypeAutoInfo
            hasPropertyType={hasPropertyType}
            associationPropertyType={associationPropertyType}
            importType={importType}
            associationId={associationId}
          />

          {/* Column Mapping */}
          <ColumnMappingList
            fileColumns={fileColumns}
            systemFields={systemFields}
            mappings={mappings}
            onMappingChange={handleMappingChange}
            previewData={previewData}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMapping} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Confirm & Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataMappingModal;
