
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
  const [selectedAssociation, setSelectedAssociation] = React.useState(currentAssociation);

  // Set the first association as default if available and none is selected
  useEffect(() => {
    if (userAssociations?.length > 0) {
      if (!selectedAssociation) {
        // No association selected yet, use current or first one
        const assocToUse = currentAssociation || userAssociations[0].associations;
        console.log('Setting initial association:', assocToUse.id, assocToUse.name);
        setSelectedAssociation(assocToUse);
        
        if (onAssociationChange) {
          onAssociationChange(assocToUse.id);
        }
      }
    }
  }, [userAssociations, currentAssociation, selectedAssociation, onAssociationChange, setCurrentAssociation]);

  if (!userAssociations || userAssociations.length === 0) {
    console.log('No associations available');
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-amber-600 font-medium">
          No associations available. Please create an association first.
        </span>
      </div>
    );
  }

  const handleSelect = (associationId: string) => {
    console.log('Association selected:', associationId);
    const selected = userAssociations.find(
      (assoc) => assoc.associations.id === associationId
    );
    
    if (selected) {
      console.log('Setting selected association:', selected.associations.name);
      setSelectedAssociation(selected.associations);
      setCurrentAssociation(selected.associations);
      
      if (onAssociationChange) {
        onAssociationChange(associationId);
        console.log('Association change handler called with:', associationId);
      }
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedAssociation?.name || "Select an HOA"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="w-full">
            <CommandInput placeholder="Search HOA..." />
            <CommandEmpty className="py-3 text-center">No HOA found.</CommandEmpty>
            <CommandGroup>
              {userAssociations.map((association) => (
                <CommandItem
                  key={association.associations.id}
                  value={association.associations.id}
                  onSelect={() => handleSelect(association.associations.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAssociation?.id === association.associations.id
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
      {selectedAssociation && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
          {userAssociations.find(a => a.associations.id === selectedAssociation.id)?.role || 'member'}
        </span>
      )}
    </div>
  );
}

export default AssociationSelector;
