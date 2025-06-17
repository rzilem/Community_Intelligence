
import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react';
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
  const selectedField = systemFields.find(field => field.value === selectedValue);
  
  console.log(`ColumnMappingField render for ${column}:`, {
    systemFieldsCount: systemFields?.length || 0,
    selectedValue,
    suggestion,
    confidence,
    isOpen
  });

  const handleSelect = (value: string) => {
    console.log(`Field selection for ${column}: ${value}`);
    onMappingChange(column, value);
    setIsOpen(false);
  };

  const handleSuggestionApply = () => {
    if (suggestion) {
      console.log(`Applying suggestion for ${column}: ${suggestion}`);
      onMappingChange(column, suggestion);
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 p-3 border rounded-lg bg-card">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Column name section */}
        <div className="col-span-4">
          <div className="text-sm font-medium text-foreground">{column}</div>
          {suggestion && !selectedValue && confidence >= 0.6 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center text-xs text-muted-foreground mt-1 cursor-pointer hover:text-foreground" 
                    onClick={handleSuggestionApply}
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                    <span className="hover:underline">
                      Suggested: {systemFields.find(f => f.value === suggestion)?.label || suggestion}
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
                className="w-full justify-between h-10"
              >
                <span className="truncate">
                  {selectedValue && selectedField
                    ? selectedField.label
                    : "Select field..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search fields..." className="h-9" />
                <CommandEmpty>No field found.</CommandEmpty>
                <CommandList className="max-h-[300px]">
                  <CommandGroup>
                    {/* Add option to clear selection */}
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
                    
                    {/* Render all system fields */}
                    {systemFields && systemFields.map((field) => (
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
    </div>
  );
};

export default ColumnMappingField;
