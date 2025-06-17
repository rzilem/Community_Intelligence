
import React, { useState, useEffect } from 'react';
import ColumnMappingField from './ColumnMappingField';
import { MappingOption } from './types/mapping-types';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAIMappingSuggestions } from '@/hooks/import-export/useAIMappingSuggestions';
import { toast } from 'sonner';

interface ColumnMappingListProps {
  fileColumns: string[];
  systemFields: MappingOption[];
  mappings: Record<string, string>;
  onMappingChange: (column: string, field: string) => void;
  previewData: any[];
}

const ColumnMappingList: React.FC<ColumnMappingListProps> = ({
  fileColumns,
  systemFields,
  mappings,
  onMappingChange,
  previewData
}) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  
  const { 
    suggestions, 
    isGenerating, 
    generateSuggestions 
  } = useAIMappingSuggestions(fileColumns, systemFields, previewData);

  // Generate suggestions when component mounts and we have data
  useEffect(() => {
    if (fileColumns.length > 0 && systemFields.length > 0 && previewData.length > 0) {
      console.log("Auto-generating suggestions on mount with", systemFields.length, "system fields");
      generateSuggestions();
    }
  }, [fileColumns, systemFields, previewData, generateSuggestions]);

  const handleMappingChange = (column: string, field: string) => {
    console.log(`Manual mapping change: ${column} -> ${field}`);
    onMappingChange(column, field);
    setOpenState(prev => ({
      ...prev,
      [column]: false
    }));
  };

  const setIsOpen = (column: string, isOpen: boolean) => {
    setOpenState(prev => ({
      ...prev,
      [column]: isOpen
    }));
  };
  
  const handleAutoMapColumns = () => {
    console.log("Auto-mapping columns with system fields:", systemFields);
    const newSuggestions = generateSuggestions();
    
    // Track updates for toast message
    let updateCount = 0;
    
    // Create a list of unmapped columns
    const unmappedColumns = fileColumns.filter(column => !mappings[column]);
    
    // Apply suggestions for unmapped columns
    unmappedColumns.forEach(column => {
      const suggestion = newSuggestions[column];
      if (suggestion && suggestion.confidence >= 0.6) {
        console.log(`Auto-mapping: ${column} -> ${suggestion.fieldValue}`);
        onMappingChange(column, suggestion.fieldValue);
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      toast.success(`Auto-mapped ${updateCount} columns successfully`);
    } else {
      toast.info("No additional columns could be automatically mapped");
    }
  };

  console.log('Rendering ColumnMappingList with:', {
    fileColumnsCount: fileColumns.length,
    systemFieldsCount: systemFields.length,
    mappingsCount: Object.keys(mappings).length
  });

  // Show loading state if we don't have data
  if (!fileColumns || fileColumns.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">
          Loading file columns...
        </div>
      </div>
    );
  }

  if (!systemFields || systemFields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">
          Loading system fields...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Map File Columns to System Fields:</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAutoMapColumns}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? 'Analyzing...' : 'Auto-Map Columns'}
        </Button>
      </div>
      
      <div className="space-y-3">
        {fileColumns.map(column => (
          <ColumnMappingField
            key={column}
            column={column}
            systemFields={systemFields}
            selectedValue={mappings[column] || ''}
            onMappingChange={(col, field) => handleMappingChange(col, field)}
            isOpen={!!openState[column]}
            setIsOpen={(isOpen) => setIsOpen(column, isOpen)}
            suggestion={suggestions[column]?.fieldValue || ''}
            confidence={suggestions[column]?.confidence || 0}
          />
        ))}
      </div>
    </div>
  );
};

export default ColumnMappingList;
