
import React, { useState } from 'react';
import ColumnMappingField from './ColumnMappingField';
import { MappingOption } from './types/mapping-types';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAIMappingSuggestions } from './hooks/useAIMappingSuggestions';
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
    const newSuggestions = generateSuggestions();
    
    // Create a copy of the current mappings to avoid direct state mutation
    let updateCount = 0;
    
    // Apply mapping suggestions that meet confidence threshold
    Object.entries(newSuggestions).forEach(([column, suggestion]) => {
      // Apply the mapping only if it meets confidence threshold AND doesn't already have a mapping
      if (suggestion.confidence >= 0.6 && !mappings[column]) {
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
          onMappingChange={handleMappingChange}
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
