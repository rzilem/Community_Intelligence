
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

interface AssociationSelectorProps {
  /**
   * Callback function when association selection changes
   */
  onAssociationChange: (id: string) => void;
  
  /**
   * Optional initial association ID to pre-select
   */
  initialAssociationId?: string;
  
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
  
  /**
   * Optional label to display above the selector
   * Set to false to hide the label completely
   */
  label?: React.ReactNode | false;
}

const AssociationSelector: React.FC<AssociationSelectorProps> = ({ 
  onAssociationChange,
  initialAssociationId,
  className,
  label = "Select Association" // Default label that can be overridden
}) => {
  const [open, setOpen] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>(initialAssociationId);

  const { data: associations = [], isLoading, error } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: [],
      order: { column: 'name', ascending: true }
    }
  );

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error loading associations:', error);
      toast.error('Failed to load associations');
    }
  }, [error]);

  // Update selected association when initialAssociationId changes
  useEffect(() => {
    console.log('initialAssociationId changed:', initialAssociationId);
    setSelectedAssociationId(initialAssociationId);
  }, [initialAssociationId]);

  // Find selected association name
  const selectedAssociation = associations.find(assoc => assoc.id === selectedAssociationId);
  console.log('Selected association:', selectedAssociation);

  const handleSelect = (associationId: string) => {
    console.log('Association selected:', associationId);
    setSelectedAssociationId(associationId);
    onAssociationChange(associationId);
    setOpen(false);
  };

  const handleClear = () => {
    console.log('Association cleared');
    setSelectedAssociationId(undefined);
    onAssociationChange('');
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label !== false && <h3 className="font-medium mb-1">{label}</h3>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading 
              ? "Loading associations..." 
              : selectedAssociation?.name || "Select an association"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          {associations && associations.length > 0 ? (
            <Command>
              <CommandInput placeholder="Search associations..." />
              <CommandList>
                <CommandEmpty>No association found.</CommandEmpty>
                <CommandGroup>
                  {/* Add an option to clear the selection */}
                  <CommandItem
                    value="clear"
                    onSelect={handleClear}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedAssociationId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    No association
                  </CommandItem>
                  {associations.map((assoc) => (
                    <CommandItem
                      key={assoc.id}
                      value={assoc.id}
                      onSelect={() => handleSelect(assoc.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAssociationId === assoc.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {assoc.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading 
                ? "Loading associations..." 
                : "No associations available."}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AssociationSelector;
