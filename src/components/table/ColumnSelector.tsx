
import React, { useState } from 'react';
import { Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Column {
  id: string;
  label: string;
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  className?: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [localSelectedColumns, setLocalSelectedColumns] = useState<string[]>(selectedColumns);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = localSelectedColumns.includes(columnId)
      ? localSelectedColumns.filter(id => id !== columnId)
      : [...localSelectedColumns, columnId];

    // Ensure at least one column is selected
    if (updatedColumns.length === 0) {
      return;
    }

    setLocalSelectedColumns(updatedColumns);
    onChange(updatedColumns);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Columns className="h-4 w-4 mr-2" />
          Customize Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <h3 className="font-medium mb-2">Display Columns</h3>
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {columns.map(column => (
            <div key={column.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`column-${column.id}`}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-4">
          At least one column must be selected
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnSelector;
