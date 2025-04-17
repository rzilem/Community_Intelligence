
import React, { useState, useEffect } from 'react';
import { Columns, GripVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import TooltipButton from '@/components/ui/tooltip-button';

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
  const [localSelectedColumns, setLocalSelectedColumns] = useState<string[]>(selectedColumns);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Update local state when selectedColumns prop changes
  useEffect(() => {
    setLocalSelectedColumns(selectedColumns);
  }, [selectedColumns]);

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

  const handleResetClick = () => {
    if (resetToDefaults) {
      resetToDefaults();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TooltipButton 
          variant="outline" 
          className={className} 
          tooltip="Customize visible columns"
        >
          <Columns className="h-4 w-4 mr-2" />
          Customize Columns
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <h3 className="font-medium mb-2">Display Columns</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {onReorder ? "Drag to reorder columns" : "Select columns to display"}
        </p>
        <div className="space-y-1 max-h-[300px] overflow-auto">
          {columns.map((column, index) => (
            <div 
              key={column.id} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
              draggable={onReorder !== undefined}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {onReorder && (
                <div className="flex items-center justify-center cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Checkbox 
                id={`column-${column.id}`}
                checked={localSelectedColumns.includes(column.id)}
                onCheckedChange={() => handleColumnToggle(column.id)}
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
        <div className="text-xs text-muted-foreground mt-4">
          At least one column must be selected
        </div>
        {resetToDefaults && (
          <TooltipButton 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full"
            onClick={handleResetClick}
            tooltip="Reset columns to default configuration"
          >
            Reset to Defaults
          </TooltipButton>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ColumnSelector;
