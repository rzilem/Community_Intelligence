
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
  
  // Check if this is a city, state, or zip column for special handling
  const isSpecialColumn = column.toLowerCase() === 'city' || 
                          column.toLowerCase() === 'state' || 
                          column.toLowerCase() === 'zip' ||
                          column.toLowerCase() === 'zipcode' ||
                          column.toLowerCase() === 'postal' ||
                          column.toLowerCase() === 'postal_code';
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4">
          <div className="text-sm font-medium">{column}</div>
          {suggestion && !selectedValue && confidence >= 0.6 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-pointer" onClick={handleSuggestionApply}>
                    <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                    <span className="hover:underline">Suggested: {systemFields.find(f => f.value === suggestion)?.label || suggestion}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to apply this suggestion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="col-span-8">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className={cn(
                  "w-full justify-between",
                  isSpecialColumn && !selectedValue ? "border-amber-400 ring-1 ring-amber-400" : ""
                )}
              >
                {selectedValue
                  ? systemFields.find(f => f.value === selectedValue)?.label || "Select field..."
                  : "Select field..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-50" align="start" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search fields..." className="h-9" />
                <CommandEmpty>No field found.</CommandEmpty>
                <CommandGroup>
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    {Array.isArray(systemFields) && systemFields.map((field) => (
                      <CommandItem
                        key={field.value}
                        value={field.value}
                        onSelect={() => handleSelect(field.value)}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <span>{field.label}</span>
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
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingField;
