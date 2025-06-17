
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

  console.log('ColumnMappingList RENDER:', {
    fileColumns,
    fileColumnsLength: fileColumns?.length,
    systemFields,
    systemFieldsLength: systemFields?.length,
    mappings,
    previewDataLength: previewData?.length
  });

  // Generate suggestions when component mounts and we have data
  useEffect(() => {
    if (fileColumns?.length > 0 && systemFields?.length > 0 && previewData?.length > 0) {
      console.log("Auto-generating suggestions on mount");
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
    console.log("Smart auto-mapping columns triggered");
    const newSuggestions = generateSuggestions();
    
    // Track updates for toast message
    let updateCount = 0;
    const usedFields = new Set<string>();
    
    // First, preserve existing mappings
    Object.values(mappings).forEach(field => {
      if (field) usedFields.add(field);
    });
    
    // Create a list of unmapped columns
    const unmappedColumns = fileColumns.filter(column => !mappings[column]);
    
    // Sort unmapped columns by suggestion confidence (highest first)
    const sortedUnmappedColumns = unmappedColumns.sort((a, b) => {
      const aConfidence = newSuggestions[a]?.confidence || 0;
      const bConfidence = newSuggestions[b]?.confidence || 0;
      return bConfidence - aConfidence;
    });
    
    // Apply suggestions for unmapped columns, ensuring no duplicates
    sortedUnmappedColumns.forEach(column => {
      const suggestion = newSuggestions[column];
      if (suggestion && suggestion.confidence >= 0.6 && !usedFields.has(suggestion.fieldValue)) {
        console.log(`Smart auto-mapping: ${column} -> ${suggestion.fieldValue} (confidence: ${suggestion.confidence})`);
        onMappingChange(column, suggestion.fieldValue);
        usedFields.add(suggestion.fieldValue);
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      toast.success(`Smart-mapped ${updateCount} columns with no duplicates`);
    } else {
      toast.info("No additional columns could be automatically mapped");
    }
  };

  // Check if we have the minimum data needed to render
  const hasFileColumns = Array.isArray(fileColumns) && fileColumns.length > 0;
  const hasSystemFields = Array.isArray(systemFields) && systemFields.length > 0;

  console.log('ColumnMappingList RENDER DECISION:', {
    hasFileColumns,
    hasSystemFields,
    willRender: hasFileColumns
  });

  // Always show something if we don't have file columns
  if (!hasFileColumns) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground p-8 border rounded-lg">
          <p>No file columns detected.</p>
          <p className="text-sm mt-2">Please check your file format or try uploading again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {/* Header with Smart Auto-Map button - more compact */}
      <div className="flex items-center justify-between py-2 border-b">
        <h3 className="text-sm font-medium">Map File Columns to System Fields</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAutoMapColumns}
          disabled={isGenerating || !hasSystemFields}
          className="flex items-center gap-1 text-xs px-2 py-1 h-7"
        >
          <Sparkles className="h-3 w-3" />
          {isGenerating ? 'Analyzing...' : 'Smart Auto-Map'}
        </Button>
      </div>
      
      {/* Mapping fields - more compact spacing */}
      <div className="space-y-2">
        {fileColumns.map((column, index) => {
          console.log(`Rendering mapping field ${index + 1}/${fileColumns.length} for column: "${column}"`);
          return (
            <ColumnMappingField
              key={`column-${column}-${index}`}
              column={column}
              systemFields={hasSystemFields ? systemFields : []}
              selectedValue={mappings[column] || ''}
              onMappingChange={(col, field) => handleMappingChange(col, field)}
              isOpen={!!openState[column]}
              setIsOpen={(isOpen) => setIsOpen(column, isOpen)}
              suggestion={suggestions[column]?.fieldValue || ''}
              confidence={suggestions[column]?.confidence || 0}
            />
          );
        })}
      </div>
      
      {/* Footer info - more compact */}
      <div className="text-[10px] text-muted-foreground pt-2 border-t">
        <div>Found {fileColumns.length} columns. Smart auto-mapping prevents duplicate field assignments.</div>
        {!hasSystemFields && (
          <div className="text-amber-600 mt-1">
            ⚠️ System fields are still loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnMappingList;
