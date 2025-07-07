
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
   * Current selected value (controlled component)
   */
  value?: string;
  
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
  
  /**
   * Optional label to display above the selector
   * Set to false to hide the label completely
   */
  label?: React.ReactNode | false;

  /**
   * Whether to show "All Associations" option
   */
  showAllOption?: boolean;
  
  /**
   * Placeholder text when no association is selected
   */
  placeholder?: string;
  
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

const AssociationSelector: React.FC<AssociationSelectorProps> = ({ 
  onAssociationChange,
  initialAssociationId,
  value,
  className,
  label = "Select Association", // Default label that can be overridden
  showAllOption = false,
  placeholder = "Select an association",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>(
    value || initialAssociationId
  );

  const { data: associations = [], isLoading, error } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: [
        { column: 'is_archived', operator: 'eq', value: false },
        { column: 'status', operator: 'eq', value: 'active' }
      ],
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

  // Update selected association when value or initialAssociationId changes
  useEffect(() => {
    const newValue = value || initialAssociationId;
    console.log('Association value changed:', newValue);
    setSelectedAssociationId(newValue);
  }, [value, initialAssociationId]);

  // Find selected association name
  const selectedAssociation = associations.find(assoc => assoc.id === selectedAssociationId);
  console.log('Selected association:', selectedAssociation);

  // Determine display text
  const getDisplayText = () => {
    if (selectedAssociationId === 'all') {
      return 'All Associations';
    }
    if (selectedAssociation) {
      return selectedAssociation.name;
    }
    return placeholder;
  };

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
            disabled={isLoading || disabled}
          >
            {isLoading 
              ? "Loading associations..." 
              : getDisplayText()}
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
                  {/* Show All Associations option if enabled */}
                  {showAllOption && (
                    <CommandItem
                      value="all-associations"
                      onSelect={() => handleSelect('all')}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAssociationId === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Associations
                    </CommandItem>
                  )}
                  
                  {/* Add an option to clear the selection */}
                  <CommandItem
                    value="clear"
                    onSelect={handleClear}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedAssociationId || selectedAssociationId === '' ? "opacity-100" : "opacity-0"
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
                : "No active associations available."}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AssociationSelector;
