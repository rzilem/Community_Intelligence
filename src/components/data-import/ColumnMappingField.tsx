
import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Sparkles, Loader2 } from 'lucide-react';
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
  const selectedField = systemFields?.find(field => field.value === selectedValue);
  const hasSystemFields = Array.isArray(systemFields) && systemFields.length > 0;
  
  console.log(`ColumnMappingField render for "${column}":`, {
    systemFieldsCount: systemFields?.length || 0,
    selectedValue,
    selectedField: selectedField?.label,
    suggestion,
    confidence,
    isOpen,
    hasSystemFields
  });

  const handleSelect = (value: string) => {
    console.log(`Field selection for "${column}": ${value}`);
    onMappingChange(column, value);
    setIsOpen(false);
  };

  const handleSuggestionApply = () => {
    if (suggestion) {
      console.log(`Applying suggestion for "${column}": ${suggestion}`);
      onMappingChange(column, suggestion);
    }
  };
  
  return (
    <div className="flex flex-col space-y-1 p-2 border rounded bg-card">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Column name section - more compact */}
        <div className="col-span-4">
          <div className="text-sm font-medium text-foreground truncate" title={column}>
            {column}
          </div>
          {suggestion && !selectedValue && confidence >= 0.6 && hasSystemFields && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center text-[10px] text-muted-foreground mt-0.5 cursor-pointer hover:text-foreground" 
                    onClick={handleSuggestionApply}
                  >
                    <Sparkles className="h-2.5 w-2.5 mr-1 text-amber-500" />
                    <span className="hover:underline truncate">
                      {systemFields.find(f => f.value === suggestion)?.label || suggestion}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to apply this AI suggestion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                className="w-full justify-between h-8 text-xs"
                disabled={!hasSystemFields}
              >
                <span className="truncate">
                  {!hasSystemFields ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : selectedValue && selectedField ? (
                    selectedField.label
                  ) : (
                    "Select field..."
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search fields..." className="h-8 text-xs" />
                <CommandEmpty>
                  {!hasSystemFields ? "Loading fields..." : "No field found."}
                </CommandEmpty>
                <CommandList className="max-h-[300px]">
                  <CommandGroup>
                    {/* Add option to clear selection */}
                    <CommandItem
                      key="clear-selection"
                      value=""
                      onSelect={() => handleSelect('')}
                      className="cursor-pointer flex items-center justify-between text-muted-foreground text-xs"
                    >
                      <span>Don't map this column</span>
                      <Check
                        className={cn(
                          "ml-auto h-3 w-3",
                          !selectedValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                    
                    {/* Render all system fields */}
                    {hasSystemFields && systemFields.map((field) => (
                      <CommandItem
                        key={field.value}
                        value={field.label}
                        onSelect={() => handleSelect(field.value)}
                        className="cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col">
                          <span>{field.label}</span>
                          <span className="text-[10px] text-muted-foreground">{field.value}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-3 w-3",
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
    </div>
  );
};

export default ColumnMappingField;
