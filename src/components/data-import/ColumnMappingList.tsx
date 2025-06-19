
import React, { useState, useEffect } from 'react';
import EnhancedColumnMappingField from './EnhancedColumnMappingField';
import { MappingOption } from './types/mapping-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, AlertCircle } from 'lucide-react';
import { useAIMappingSuggestions } from '@/hooks/import-export/useAIMappingSuggestions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ColumnMappingListProps {
  fileColumns: string[];
  systemFields: MappingOption[];
  mappings: Record<string, string>;
  onMappingChange: (column: string, field: string) => void;
  previewData: any[];
  dataType?: string;
  associationId?: string;
}

const ColumnMappingList: React.FC<ColumnMappingListProps> = ({
  fileColumns,
  systemFields,
  mappings,
  onMappingChange,
  previewData,
  dataType,
  associationId
}) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  
  const { 
    suggestions, 
    isGenerating, 
    analysisQuality,
    analysisIssues,
    overallRecommendations,
    generateSuggestions,
    applyBulkSuggestions
  } = useAIMappingSuggestions(fileColumns, systemFields, previewData, dataType, associationId);

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
      console.log("Auto-generating AI suggestions on mount");
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
  
  const handleSmartAutoMap = () => {
    console.log("Smart AI auto-mapping triggered");
    const appliedCount = applyBulkSuggestions(onMappingChange);
    
    if (appliedCount === 0) {
      toast.info("No high-confidence AI suggestions available for automatic mapping");
    }
  };

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
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
    <div className="space-y-4">
      {/* AI Analysis Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">AI-Powered Column Mapping</CardTitle>
              {analysisQuality && (
                <Badge variant={getQualityBadgeVariant(analysisQuality)}>
                  {analysisQuality} quality
                </Badge>
              )}
            </div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSmartAutoMap}
              disabled={isGenerating || !hasSystemFields || Object.keys(suggestions).length === 0}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isGenerating ? 'Analyzing...' : 'Smart Auto-Map'}
            </Button>
          </div>
          <CardDescription>
            AI is analyzing your data to suggest the best field mappings with reasoning and confidence scores.
          </CardDescription>
        </CardHeader>
        
        {/* Analysis Issues and Recommendations */}
        {(analysisIssues.length > 0 || overallRecommendations.length > 0) && (
          <CardContent className="pt-0 space-y-3">
            {analysisIssues.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issues Found:</strong> {analysisIssues.join(', ')}
                </AlertDescription>
              </Alert>
            )}
            
            {overallRecommendations.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendations:</strong> {overallRecommendations.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Mapping fields */}
      <div className="space-y-3">
        {fileColumns.map((column, index) => {
          console.log(`Rendering enhanced mapping field ${index + 1}/${fileColumns.length} for column: "${column}"`);
          return (
            <EnhancedColumnMappingField
              key={`column-${column}-${index}`}
              column={column}
              systemFields={hasSystemFields ? systemFields : []}
              selectedValue={mappings[column] || ''}
              onMappingChange={handleMappingChange}
              isOpen={!!openState[column]}
              setIsOpen={(isOpen) => setIsOpen(column, isOpen)}
              aiSuggestion={suggestions[column]}
            />
          );
        })}
      </div>
      
      {/* Footer info */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Found {fileColumns.length} columns. AI suggestions include confidence scores and reasoning.</div>
            <div>Smart auto-mapping applies only high-confidence suggestions to prevent conflicts.</div>
            {!hasSystemFields && (
              <div className="text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                System fields are still loading...
              </div>
            )}
            {isGenerating && (
              <div className="text-blue-600 flex items-center gap-1">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI is analyzing your data...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColumnMappingList;
