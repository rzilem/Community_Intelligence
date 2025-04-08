
import React, { useState } from 'react';
import { Columns, GripVertical } from 'lucide-react';
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
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
  className?: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onChange,
  onReorder,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [localSelectedColumns, setLocalSelectedColumns] = useState<string[]>(selectedColumns);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

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

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || !onReorder) return;
    
    const draggedOverItem = index;
    
    if (draggedItem === draggedOverItem) return;
    
    onReorder(draggedItem, draggedOverItem);
    setDraggedItem(draggedOverItem);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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
        <p className="text-xs text-muted-foreground mb-2">
          Drag to reorder columns
        </p>
        <div className="space-y-1 max-h-[300px] overflow-auto">
          {columns.map((column, index) => (
            <div 
              key={column.id} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-move"
              draggable={onReorder !== undefined}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center justify-center">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <Checkbox 
                id={`column-${column.id}`}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm leading-none flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
