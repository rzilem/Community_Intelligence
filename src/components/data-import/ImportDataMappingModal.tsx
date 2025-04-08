
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { dataImportService } from '@/services/import-export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface MappingOption {
  label: string;
  value: string;
}

interface ImportDataMappingModalProps {
  importType: string;
  fileData: any[];
  associationId: string;
  onClose: () => void;
  onConfirm: (mappings: Record<string, string>) => void;
  validationResults?: {
    valid: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    warnings: number;
    issues: Array<{
      row: number;
      field: string;
      issue: string;
    }>;
  };
}

const ImportDataMappingModal: React.FC<ImportDataMappingModalProps> = ({
  importType,
  fileData,
  associationId,
  onClose,
  onConfirm,
  validationResults
}) => {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  useEffect(() => {
    // Extract columns from the file data
    if (fileData.length > 0) {
      const columns = Object.keys(fileData[0]);
      setFileColumns(columns);
      
      // Set preview data (first 3 rows)
      setPreviewData(fileData.slice(0, 3));
    }
    
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
          { value: 'is_primary', label: 'Is Primary Owner' },
          { value: 'emergency_contact', label: 'Emergency Contact' }
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
          { value: 'bathrooms', label: 'Bathrooms' },
          { value: 'property_type', label: 'Property Type' }
        ]);
        break;
      case 'financial':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'assessment_type_id', label: 'Assessment Type ID' },
          { value: 'amount', label: 'Amount' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'paid', label: 'Paid Status' },
          { value: 'payment_date', label: 'Payment Date' },
          { value: 'late_fee', label: 'Late Fee Amount' }
        ]);
        break;
      case 'compliance':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'resident_id', label: 'Resident ID' },
          { value: 'violation_type', label: 'Violation Type' },
          { value: 'description', label: 'Description' },
          { value: 'status', label: 'Status' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'fine_amount', label: 'Fine Amount' },
          { value: 'resolved_date', label: 'Resolved Date' }
        ]);
        break;
      case 'maintenance':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'title', label: 'Title' },
          { value: 'description', label: 'Description' },
          { value: 'priority', label: 'Priority' },
          { value: 'status', label: 'Status' },
          { value: 'assigned_to', label: 'Assigned To' },
          { value: 'resolved_date', label: 'Resolved Date' }
        ]);
        break;
      default:
        setSystemFields([]);
    }
    
    // Load saved mappings if available
    const loadSavedMappings = async () => {
      const savedMappings = await dataImportService.getImportMapping(associationId, importType);
      if (savedMappings) {
        setMappings(savedMappings);
      } else {
        // Auto-map columns that have similar names to system fields
        autoMapColumns();
      }
    };
    
    loadSavedMappings();
  }, [importType, fileData, associationId]);
  
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Map Import Columns</DialogTitle>
          <DialogDescription>
            Match columns from your file to the corresponding system fields.
            Unmapped columns will be ignored during import.
          </DialogDescription>
        </DialogHeader>
        
        {validationResults && (
          <div className="bg-muted/30 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">Validation Results:</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {validationResults.validRows} valid rows
              </Badge>
              {validationResults.warnings > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {validationResults.warnings} warnings
                </Badge>
              )}
              {validationResults.invalidRows > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {validationResults.invalidRows} invalid rows
                </Badge>
              )}
            </div>
            
            {validationResults.issues.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">Issues found:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {validationResults.issues.slice(0, 5).map((issue, i) => (
                    <li key={i}>
                      Row {issue.row}: {issue.issue} in field "{issue.field}"
                    </li>
                  ))}
                  {validationResults.issues.length > 5 && (
                    <li>...and {validationResults.issues.length - 5} more issues</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {/* Data Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Data Preview:</h3>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fileColumns.map(column => (
                      <TableHead key={column} className="whitespace-nowrap">{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {fileColumns.map(column => (
                        <TableCell key={`${index}-${column}`} className="truncate max-w-[200px]">
                          {row[column] || ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Showing first {previewData.length} of {fileData.length} rows
            </p>
          </div>
          
          {/* Column Mappings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Map File Columns to System Fields:</h3>
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
