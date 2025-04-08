
import React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MappingOption } from './types/mapping-types';

interface ColumnMappingFieldProps {
  column: string;
  systemFields: MappingOption[];
  selectedValue: string;
  onMappingChange: (column: string, field: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ColumnMappingField: React.FC<ColumnMappingFieldProps> = ({
  column,
  systemFields,
  selectedValue,
  onMappingChange,
  isOpen,
  setIsOpen
}) => {
  const getSelectedFieldLabel = () => {
    if (!selectedValue) return null;
    return systemFields.find(field => field.value === selectedValue)?.label;
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
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === field.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {field.label}
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
      </div>
    </div>
  );
};

export default ColumnMappingField;
