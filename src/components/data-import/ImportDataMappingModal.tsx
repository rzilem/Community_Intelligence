
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MappingOption {
  label: string;
  value: string;
}

interface ImportDataMappingModalProps {
  importType: string;
  onClose: () => void;
  onConfirm: (mappings: Record<string, string>) => void;
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  importType,
  onClose,
  onConfirm
}) => {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate loading file columns
    // In a real implementation, these would come from parsing the uploaded file
    setFileColumns(['Column A', 'First Name', 'Last Name', 'Email Address', 'Phone #', 'Unit', 'Balance']);

    // Load appropriate system fields based on importType
    switch (importType) {
      case 'associations':
        setSystemFields([
          { value: 'name', label: 'Association Name' },
          { value: 'address', label: 'Street Address' },
          { value: 'contact_email', label: 'Contact Email' }
        ]);
        break;
      case 'owners':
        setSystemFields([
          { value: 'first_name', label: 'First Name' },
          { value: 'last_name', label: 'Last Name' },
          { value: 'email', label: 'Email Address' },
          { value: 'phone', label: 'Phone Number' },
          { value: 'property_id', label: 'Property ID' },
          { value: 'move_in_date', label: 'Move-in Date' },
          { value: 'is_primary', label: 'Is Primary Owner' }
        ]);
        break;
      case 'properties':
        setSystemFields([
          { value: 'address', label: 'Street Address' },
          { value: 'unit_number', label: 'Unit Number' },
          { value: 'city', label: 'City' },
          { value: 'state', label: 'State' },
          { value: 'zip', label: 'Zip Code' },
          { value: 'square_feet', label: 'Square Footage' },
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'bathrooms', label: 'Bathrooms' }
        ]);
        break;
      case 'financial':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'amount', label: 'Amount' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'paid', label: 'Paid Status' },
          { value: 'payment_date', label: 'Payment Date' },
          { value: 'late_fee', label: 'Late Fee Amount' }
        ]);
        break;
      default:
        setSystemFields([]);
    }

    // Auto-map columns that have similar names to system fields
    const autoMapColumns = () => {
      const initialMappings: Record<string, string> = {};
      fileColumns.forEach(column => {
        const lowerColumn = column.toLowerCase();
        
        // Try to find a match
        const match = systemFields.find(field => 
          lowerColumn.includes(field.value) || 
          field.label.toLowerCase().includes(lowerColumn) ||
          lowerColumn.replace(/[^a-z0-9]/gi, '') === field.value.replace(/[^a-z0-9]/gi, '') ||
          lowerColumn.replace(/[^a-z0-9]/gi, '') === field.label.toLowerCase().replace(/[^a-z0-9]/gi, '')
        );
        
        if (match) {
          initialMappings[column] = match.value;
        }
      });
      
      setMappings(initialMappings);
    };

    // Auto-map after a short delay to ensure systemFields is set
    const timer = setTimeout(() => {
      autoMapColumns();
    }, 200);

    return () => clearTimeout(timer);
  }, [importType]);

  const handleMappingChange = (column: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: field
    }));
    setOpen(prev => ({
      ...prev,
      [column]: false
    }));
  };

  const getSelectedFieldLabel = (column: string) => {
    const fieldValue = mappings[column];
    if (!fieldValue) return null;
    return systemFields.find(field => field.value === fieldValue)?.label;
  };

  const handleConfirm = () => {
    onConfirm(mappings);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Map Import Columns</DialogTitle>
          <DialogDescription>
            Match columns from your file to the corresponding system fields.
            Unmapped columns will be ignored during import.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {fileColumns.map(column => (
              <div key={column} className="grid grid-cols-5 items-center gap-4">
                <div className="col-span-2">
                  <span className="text-sm font-medium">{column}</span>
                </div>
                <div className="col-span-3">
                  <Popover 
                    open={open[column]} 
                    onOpenChange={(isOpen) => setOpen({...open, [column]: isOpen})}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open[column]}
                        className="w-full justify-between"
                      >
                        {getSelectedFieldLabel(column) || "Select field..."}
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
                              onSelect={() => handleMappingChange(column, field.value)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  mappings[column] === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {field.label}
                            </CommandItem>
                          ))}
                          <CommandItem
                            value="ignore"
                            onSelect={() => handleMappingChange(column, '')}
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
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm and Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataMappingModal;
