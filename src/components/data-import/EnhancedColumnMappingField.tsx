
import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Sparkles, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
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
  
  const handleSelect = (value: string) => {
    console.log(`Field selection for "${column}": ${value}`);
    onMappingChange(column, value);
    setIsOpen(false);
  };

  const handleAISuggestionApply = () => {
    if (aiSuggestion?.fieldValue) {
      console.log(`Applying AI suggestion for "${column}": ${aiSuggestion.fieldValue}`);
      onMappingChange(column, aiSuggestion.fieldValue);
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  return (
    <div className="flex flex-col space-y-2 p-3 border rounded-lg bg-card">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Column name section */}
        <div className="col-span-4">
          <div className="text-sm font-medium text-foreground truncate" title={column}>
            {column}
          </div>
          
          {/* AI Suggestion Display */}
          {aiSuggestion && !selectedValue && (
            <div className="mt-1 space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded text-xs"
                      onClick={handleAISuggestionApply}
                    >
                      <Brain className="h-3 w-3 text-blue-500" />
                      <span className="truncate max-w-[120px]">
                        {systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label || aiSuggestion.fieldValue}
                      </span>
                      {getQualityIcon(aiSuggestion.dataQuality)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <div className="font-medium">AI Suggestion</div>
                      <div className="text-xs">{aiSuggestion.reasoning}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getConfidenceColor(aiSuggestion.confidence)}>
                          {Math.round(aiSuggestion.confidence * 100)}% confident
                        </Badge>
                      </div>
                      {aiSuggestion.suggestions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Suggestions: {aiSuggestion.suggestions.join(', ')}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {/* Dropdown section */}
        <div className="col-span-8">
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
                    "Loading fields..."
                  ) : selectedValue && selectedField ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedField.label}</span>
                      {aiSuggestion && selectedValue === aiSuggestion.fieldValue && (
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="h-2 w-2 mr-1" />
                          AI
                        </Badge>
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
                    
                    {/* AI suggestion at the top if available */}
                    {aiSuggestion && aiSuggestion.fieldValue && (
                      <CommandItem
                        key={`ai-${aiSuggestion.fieldValue}`}
                        value={systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label || aiSuggestion.fieldValue}
                        onSelect={() => handleSelect(aiSuggestion.fieldValue)}
                        className="cursor-pointer flex items-center justify-between bg-blue-50 border border-blue-200"
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span>{systemFields.find(f => f.value === aiSuggestion.fieldValue)?.label}</span>
                            <span className="text-xs text-muted-foreground">
                              AI Recommended ({Math.round(aiSuggestion.confidence * 100)}%)
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedValue === aiSuggestion.fieldValue ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )}
                    
                    {/* All system fields */}
                    {hasSystemFields && systemFields
                      .filter(field => field.value !== aiSuggestion?.fieldValue) // Don't duplicate AI suggestion
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
                            selectedValue === field.value ? "opacity-100" : "opacity-0"
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
    </div>
  );
};

export default EnhancedColumnMappingField;
