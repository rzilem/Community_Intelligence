
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';
import { Association } from '@/types/association-types';

interface AssociationPortalSelectorProps {
  onAssociationChange: (associationId: string) => void;
  className?: string;
}

interface AssociationUser {
  association_id: string;
  role: string;
  associations: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

const AssociationPortalSelector: React.FC<AssociationPortalSelectorProps> = ({
  onAssociationChange,
  className
}) => {
  const { currentUser, currentAssociation, setCurrentAssociation } = useAuth();
  const [open, setOpen] = useState(false);

  // Fetch associations that the user has access to
  const { data: associations = [], isLoading } = useSupabaseQuery<AssociationUser[]>(
    'association_users',
    {
      select: `
        association_id,
        role,
        associations:association_id (
          id,
          name,
          logo_url
        )
      `,
      filter: [
        { column: 'user_id', value: currentUser?.id },
        { column: 'role', value: 'admin', operator: 'eq' }
      ]
    },
    !!currentUser?.id
  );

  // Format associations for the dropdown
  const formattedAssociations = associations.map(assoc => ({
    id: assoc.association_id,
    name: assoc.associations.name,
    logo: assoc.associations.logo_url
  }));

  // When association is changed from the dropdown
  const handleAssociationChange = (associationId: string) => {
    const selectedAssociation = formattedAssociations.find(a => a.id === associationId);
    if (selectedAssociation) {
      // Create a partial Association object with just the required properties
      setCurrentAssociation({
        id: selectedAssociation.id,
        name: selectedAssociation.name,
        logo_url: selectedAssociation.logo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      onAssociationChange(associationId);
      setOpen(false);
    }
  };

  if (formattedAssociations.length <= 1 || !currentUser) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-48 justify-between", className)}
        >
          {currentAssociation ? currentAssociation.name : "Select association..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search associations..." />
          <CommandEmpty>No association found.</CommandEmpty>
          <CommandGroup>
            {formattedAssociations.map((association) => (
              <CommandItem
                key={association.id}
                value={association.id}
                onSelect={() => handleAssociationChange(association.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentAssociation?.id === association.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {association.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AssociationPortalSelector;
