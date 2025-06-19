
import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Sparkles, Loader2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MappingOption } from './types/mapping-types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AIMappingSuggestion } from '@/services/import-export/ai-powered-mapping-service';

interface EnhancedColumnMappingFieldProps {
  column: string;
  systemFields: MappingOption[];
  selectedValue: string;
  onMappingChange: (column: string, field: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  aiSuggestion?: AIMappingSuggestion;
}

const EnhancedColumnMappingField: React.FC<EnhancedColumnMappingFieldProps> = ({
  column,
  systemFields,
  selectedValue,
  onMappingChange,
  isOpen,
  setIsOpen,
  aiSuggestion
}) => {
  const selectedField = systemFields?.find(field => field.value === selectedValue);
  const hasSystemFields = Array.isArray(systemFields) && systemFields.length > 0;
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const handleSelect = (value: string) => {
    onMappingChange(column, value);
    setIsOpen(false);
  };

  const handleApplySuggestion = () => {
    if (aiSuggestion) {
      onMappingChange(column, aiSuggestion.fieldValue);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 p-3 border rounded-lg bg-card">
      {/* Header with column name and AI badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground truncate" title={column}>
            {column}
          </span>
          {aiSuggestion && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
        
        {/* Data quality indicator */}
        {aiSuggestion?.dataQuality && (
          <Badge variant={getQualityBadgeVariant(aiSuggestion.dataQuality)} className="text-xs">
            {aiSuggestion.dataQuality === 'good' && <Check className="h-3 w-3 mr-1" />}
            {aiSuggestion.dataQuality === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {aiSuggestion.dataQuality === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {aiSuggestion.dataQuality}
          </Badge>
        )}
      </div>

      {/* AI Suggestion Display */}
      {aiSuggestion && !selectedValue && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Suggestion
              </span>
              <span className={`text-xs font-medium ${getConfidenceColor(aiSuggestion.confidence)}`}>
                {Math.round(aiSuggestion.confidence * 100)}% confidence
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs"
              onClick={handleApplySuggestion}
            >
              Apply
            </Button>
          </div>
          
          <div className="text-xs text-blue-800 dark:text-blue-200 mb-1">
            <strong>Suggested:</strong> {systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label || aiSuggestion.fieldValue}
          </div>
          
          {aiSuggestion.reasoning && (
            <div className="text-xs text-muted-foreground">
              <strong>Reasoning:</strong> {aiSuggestion.reasoning}
            </div>
          )}
          
          {aiSuggestion.suggestions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              <strong>Tips:</strong> {aiSuggestion.suggestions.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Dropdown section */}
      <div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between h-9 text-sm"
              disabled={!hasSystemFields}
            >
              <span className="truncate">
                {!hasSystemFields ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading fields...
                  </div>
                ) : selectedValue && selectedField ? (
                  <div className="flex items-center justify-between w-full">
                    <span>{selectedField.label}</span>
                    {aiSuggestion && selectedValue === aiSuggestion.fieldValue && (
                      <div className="flex items-center space-x-1">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-600">
                          {Math.round(aiSuggestion.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  "Select field..."
                )}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
            <Command>
              <CommandInput placeholder="Search fields..." className="h-9" />
              <CommandEmpty>
                {!hasSystemFields ? "Loading fields..." : "No field found."}
              </CommandEmpty>
              <CommandList className="max-h-[300px]">
                <CommandGroup>
                  {/* Clear selection option */}
                  <CommandItem
                    key="clear-selection"
                    value=""
                    onSelect={() => handleSelect('')}
                    className="cursor-pointer flex items-center justify-between text-muted-foreground"
                  >
                    <span>Don't map this column</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        !selectedValue ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                  
                  {/* AI suggestion (if exists) */}
                  {aiSuggestion && (
                    <CommandItem
                      key={`ai-${aiSuggestion.fieldValue}`}
                      value={systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label || aiSuggestion.fieldValue}
                      onSelect={() => handleSelect(aiSuggestion.fieldValue)}
                      className="cursor-pointer flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-1"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          <span>{systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label}</span>
                          <span className={`text-xs ${getConfidenceColor(aiSuggestion.confidence)}`}>
                            {Math.round(aiSuggestion.confidence * 100)}%
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{aiSuggestion.fieldValue}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedValue === aiSuggestion.fieldValue
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )}
                  
                  {/* Regular system fields */}
                  {hasSystemFields && systemFields
                    .filter(field => !aiSuggestion || field.value !== aiSuggestion.fieldValue)
                    .map((field) => (
                    <CommandItem
                      key={field.value}
                      value={field.label}
                      onSelect={() => handleSelect(field.value)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{field.label}</span>
                        <span className="text-xs text-muted-foreground">{field.value}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedValue === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EnhancedColumnMappingField;
