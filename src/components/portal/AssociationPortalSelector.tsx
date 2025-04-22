
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth';

interface AssociationPortalSelectorProps {
  onAssociationChange: (associationId: string) => void;
}

const AssociationPortalSelector = ({ onAssociationChange }: AssociationPortalSelectorProps) => {
  const { currentAssociation, userAssociations } = useAuth();
  const [open, setOpen] = useState(false);

  // Safety check: ensure userAssociations exists before using it
  const associations = userAssociations || [];
  
  // If there's only one association or none, don't show the selector
  if (associations.length <= 1) return null;

  const currentAssociationName = currentAssociation?.name || 'Select Association';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <Building className="mr-2 h-4 w-4" />
          <span className="truncate">{currentAssociationName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search association..." />
          <CommandEmpty>No association found.</CommandEmpty>
          <CommandGroup>
            {associations.map((association) => (
              <CommandItem
                key={association.id}
                value={association.association_id || association.id}
                onSelect={(value) => {
                  onAssociationChange(value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentAssociation?.id === (association.association_id || association.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{association.associations?.name || 'Unnamed Association'}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AssociationPortalSelector;
