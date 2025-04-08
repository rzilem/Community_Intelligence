
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AssociationSelectorProps {
  onAssociationChange?: (associationId: string) => void;
  className?: string;
}

export function AssociationSelector({ onAssociationChange, className }: AssociationSelectorProps) {
  const { userAssociations, currentAssociation, setCurrentAssociation } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Set the first association as default if available and none is selected
  useEffect(() => {
    if (userAssociations?.length > 0 && !currentAssociation) {
      const firstAssociation = userAssociations[0].associations;
      setCurrentAssociation(firstAssociation);
      if (onAssociationChange) {
        onAssociationChange(firstAssociation.id);
      }
    }
  }, [userAssociations, currentAssociation, setCurrentAssociation, onAssociationChange]);

  if (!userAssociations || userAssociations.length === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-muted-foreground">No associations available</span>
      </div>
    );
  }

  const handleSelect = (associationId: string) => {
    const selected = userAssociations.find(
      (assoc) => assoc.associations.id === associationId
    );
    
    if (selected) {
      setCurrentAssociation(selected.associations);
      if (onAssociationChange) {
        onAssociationChange(associationId);
        console.log('Association changed to:', associationId);
      }
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] justify-between"
          >
            {currentAssociation?.name || "Select an HOA"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search HOA..." />
            <CommandEmpty>No HOA found.</CommandEmpty>
            <CommandGroup>
              {userAssociations.map((association) => (
                <CommandItem
                  key={association.associations.id}
                  value={association.associations.id}
                  onSelect={() => handleSelect(association.associations.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentAssociation?.id === association.associations.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {association.associations.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {currentAssociation && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
          {userAssociations.find(a => a.associations.id === currentAssociation.id)?.role || 'member'}
        </span>
      )}
    </div>
  );
}

export default AssociationSelector;
