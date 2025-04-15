
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

  // Make sure we have the system fields loaded before generating suggestions
  useEffect(() => {
    if (fileColumns.length > 0 && systemFields.length > 0 && previewData.length > 0) {
      console.log("Generating suggestions on ColumnMappingList mount with", systemFields.length, "system fields");
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
    
    // First, find city, state, zip fields directly if they exist
    const cityField = systemFields.find(f => f.value === 'city' || f.value === 'property.city');
    const stateField = systemFields.find(f => f.value === 'state' || f.value === 'property.state');
    const zipField = systemFields.find(f => f.value === 'zip' || f.value === 'property.zip');
    
    unmappedColumns.forEach(column => {
      const lowerColumn = column.toLowerCase();
      
      // Direct mapping for city, state, zip - higher priority
      if (lowerColumn === 'city' && cityField) {
        onMappingChange(column, cityField.value);
        updateCount++;
      } 
      else if (lowerColumn === 'state' && stateField) {
        onMappingChange(column, stateField.value);
        updateCount++;
      } 
      else if ((lowerColumn === 'zip' || lowerColumn === 'zipcode' || lowerColumn === 'postal_code' || lowerColumn === 'postal') && zipField) {
        onMappingChange(column, zipField.value);
        updateCount++;
      }
      // For other columns, use AI suggestion if confidence is high enough
      else {
        const suggestion = newSuggestions[column];
        if (suggestion && suggestion.confidence >= 0.6) {
          console.log(`Auto-mapping: ${column} -> ${suggestion.fieldValue}`);
          onMappingChange(column, suggestion.fieldValue);
          updateCount++;
        }
      }
    });
    
    if (updateCount > 0) {
      toast.success(`Auto-mapped ${updateCount} columns successfully`);
    } else {
      toast.info("No additional columns could be automatically mapped");
    }
  };

  // Ensure we have a valid systemFields array
  const safeSystemFields = Array.isArray(systemFields) ? systemFields : [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
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
      
      {Array.isArray(fileColumns) && fileColumns.map(column => (
        <ColumnMappingField
          key={column}
          column={column}
          systemFields={safeSystemFields}
          selectedValue={mappings[column] || ''}
          onMappingChange={(col, field) => handleMappingChange(col, field)}
          isOpen={!!openState[column]}
          setIsOpen={(isOpen) => setIsOpen(column, isOpen)}
          suggestion={suggestions[column]?.fieldValue || ''}
          confidence={suggestions[column]?.confidence || 0}
        />
      ))}
    </div>
  );
};

export default ColumnMappingList;
