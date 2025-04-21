
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePropertySearch } from '@/hooks/properties/usePropertySearch';
import { Property } from '@/types/property-types';

interface PropertySearchComboboxProps {
  onPropertySelect: (property: Property | null) => void;
  value?: string;
}

export const PropertySearchCombobox: React.FC<PropertySearchComboboxProps> = ({
  onPropertySelect,
  value
}) => {
  const [open, setOpen] = React.useState(false);
  const { properties, isLoading, handleSearch } = usePropertySearch();
  const [selectedAddress, setSelectedAddress] = React.useState(value || '');

  const handleSelect = (address: string, property: Property) => {
    setSelectedAddress(address);
    setOpen(false);
    onPropertySelect(property);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAddress || "Search for property..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search property address..." 
            onValueChange={handleSearch}
            className="h-9"
          />
          <CommandEmpty>{isLoading ? 'Searching...' : 'No property found.'}</CommandEmpty>
          <CommandGroup>
            {properties.map((property) => {
              const fullAddress = `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}, ${property.city}, ${property.state} ${property.zip}`;
              return (
                <CommandItem
                  key={property.id}
                  value={fullAddress}
                  onSelect={() => handleSelect(fullAddress, property)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAddress === fullAddress ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {fullAddress}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
