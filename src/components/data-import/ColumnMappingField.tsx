
import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, SparklesIcon } from 'lucide-react';
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
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4">
          <div className="text-sm font-medium">{column}</div>
          {suggestion && !selectedValue && confidence >= 0.7 && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <SparklesIcon className="h-3 w-3 mr-1 text-amber-500" />
              <span>Suggested: {suggestion}</span>
            </div>
          )}
        </div>
        
        <div className="col-span-8">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className="w-full justify-between"
              >
                {selectedValue
                  ? selectedField?.label || "Select field..."
                  : "Select field..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search fields..." className="h-9" />
                <CommandEmpty>No field found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {Array.isArray(systemFields) && systemFields.map((field) => (
                      <CommandItem
                        key={field.value}
                        value={field.value}
                        onSelect={(currentValue) => {
                          onMappingChange(column, currentValue);
                        }}
                      >
                        {field.label}
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
