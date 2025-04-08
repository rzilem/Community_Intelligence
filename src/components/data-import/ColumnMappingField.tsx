
import React from 'react';
import { Check, ChevronsUpDown, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MappingOption } from './types/mapping-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnMappingFieldProps {
  column: string;
  systemFields: MappingOption[];
  selectedValue: string;
  onMappingChange: (column: string, field: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  suggestion?: string;
  confidence?: number;
}

const ColumnMappingField: React.FC<ColumnMappingFieldProps> = ({
  column,
  systemFields,
  selectedValue,
  onMappingChange,
  isOpen,
  setIsOpen,
  suggestion,
  confidence = 0
}) => {
  const getSelectedFieldLabel = () => {
    if (!selectedValue) return null;
    return systemFields.find(field => field.value === selectedValue)?.label;
  };

  const getSuggestionLabel = () => {
    if (!suggestion) return null;
    return systemFields.find(field => field.value === suggestion)?.label;
  };
  
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-amber-500";
    return "bg-gray-300";
  };

  const handleApplySuggestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestion) {
      onMappingChange(column, suggestion);
    }
  };

  return (
    <div className="grid grid-cols-5 items-center gap-4">
      <div className="col-span-2">
        <span className="text-sm font-medium">{column}</span>
      </div>
      <div className="col-span-3">
        <Popover 
          open={isOpen} 
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              {getSelectedFieldLabel() || "Select field..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search fields..." />
              <CommandEmpty>No field found.</CommandEmpty>
              <CommandGroup>
                {systemFields.map(field => (
                  <CommandItem
                    key={field.value}
                    value={field.value}
                    onSelect={() => onMappingChange(column, field.value)}
                    className={cn(
                      field.value === suggestion && !selectedValue && "bg-muted/50 border-l-4 border-primary"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === field.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {field.label}
                    {field.value === suggestion && !selectedValue && (
                      <div className="ml-auto flex items-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary mr-1" />
                        <span className="text-xs text-primary">Suggested</span>
                      </div>
                    )}
                  </CommandItem>
                ))}
                <CommandItem
                  value="ignore"
                  onSelect={() => onMappingChange(column, '')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Ignore this column
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {suggestion && !selectedValue && (
          <div className="flex items-center mt-1 text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("w-2 h-2 rounded-full mr-1", getConfidenceColor())}></div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {confidence >= 0.8 ? 'High confidence' : 
                   confidence >= 0.6 ? 'Medium confidence' : 'Low confidence'} 
                  ({Math.round(confidence * 100)}%)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-muted-foreground mr-1">Suggested:</span>
            <span className="font-medium">{getSuggestionLabel()}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-5 text-xs px-2" 
              onClick={handleApplySuggestion}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnMappingField;
