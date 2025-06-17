
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
    console.log("Auto-mapping columns triggered");
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
          <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
            <strong>Debug Info:</strong>
            <br />File columns: {JSON.stringify(fileColumns)}
            <br />Type: {typeof fileColumns}
            <br />Is Array: {Array.isArray(fileColumns)}
            <br />Length: {fileColumns?.length || 'undefined'}
          </div>
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
          disabled={isGenerating || !hasSystemFields}
          className="flex items-center gap-1"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? 'Analyzing...' : 'Auto-Map Columns'}
        </Button>
      </div>
      
      <div className="space-y-3 border rounded-lg p-4">
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
      
      <div className="text-xs text-muted-foreground mt-2">
        Found {fileColumns.length} columns in your file. Select a system field for each column you want to import.
        {!hasSystemFields && (
          <div className="text-amber-600 mt-1">
            ⚠️ System fields are still loading...
          </div>
        )}
      </div>
      
      {/* Debug information */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
        <div className="mt-2 text-xs bg-gray-50 p-3 rounded border space-y-2">
          <div><strong>File Columns ({fileColumns.length}):</strong> {fileColumns.join(', ')}</div>
          <div><strong>System Fields ({systemFields?.length || 0}):</strong> {systemFields?.slice(0, 5).map(f => f.label).join(', ') || 'Loading...'}...</div>
          <div><strong>Current Mappings:</strong> {JSON.stringify(mappings, null, 2)}</div>
        </div>
      </details>
    </div>
  );
};

export default ColumnMappingList;
