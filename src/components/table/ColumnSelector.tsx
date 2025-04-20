
import React, { useState, useEffect } from 'react';
import { Columns, GripVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface Column {
  id: string;
  label: string;
}

interface ColumnSelectorProps {
  columns: Column[];
  selectedColumns: string[];
  onChange: (selectedColumns: string[]) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  resetToDefaults?: () => void;
  className?: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  resetToDefaults,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState<string[]>(selectedColumns || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update local state when selectedColumns prop changes
  useEffect(() => {
    setLocalColumns(selectedColumns || []);
  }, [selectedColumns]);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = localColumns.includes(columnId)
      ? localColumns.filter(id => id !== columnId)
      : [...localColumns, columnId];
    
    if (updatedColumns.length > 0) {
      setLocalColumns(updatedColumns);
      onChange(updatedColumns);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorder) return;
    
    if (draggedIndex !== index) {
      // Create a copy of the local columns array to modify
      const newOrder = [...localColumns];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(index, 0, removed);
      
      // Update local state and call the reorder function
      setLocalColumns(newOrder);
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Filter only valid columns that exist in the columns array
  const validColumns = columns.filter(col => 
    localColumns.includes(col.id) || !localColumns.includes(col.id)
  );

  // Get selected column objects
  const selectedColumnObjects = validColumns
    .filter(col => localColumns.includes(col.id))
    .sort((a, b) => localColumns.indexOf(a.id) - localColumns.indexOf(b.id));

  // Get unselected column objects
  const unselectedColumnObjects = validColumns
    .filter(col => !localColumns.includes(col.id));

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
        <p className="text-xs text-muted-foreground mb-2">
          {onReorder ? "Drag to reorder columns" : "Select columns to display"}
        </p>
        
        <div className="space-y-1 max-h-[300px] overflow-auto">
          {selectedColumnObjects.map((column, index) => (
            <div 
              key={column.id}
              draggable={onReorder !== undefined}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
            >
              {onReorder && (
                <div className="cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Checkbox 
                checked={localColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
                id={`column-${column.id}`}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm leading-none flex-1 cursor-pointer"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>

        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-muted-foreground mb-2">Available Columns</p>
          <div className="space-y-1 max-h-[150px] overflow-auto">
            {unselectedColumnObjects.map(column => (
              <div 
                key={column.id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
              >
                <Checkbox 
                  checked={false}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                  id={`column-${column.id}`}
                />
                <label 
                  htmlFor={`column-${column.id}`}
                  className="text-sm leading-none flex-1 cursor-pointer"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {resetToDefaults && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ColumnSelector;
