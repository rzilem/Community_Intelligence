
import React, { useState } from 'react';
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = selectedColumns.includes(columnId)
      ? selectedColumns.filter(id => id !== columnId)
      : [...selectedColumns, columnId];
    
    if (updatedColumns.length > 0) {
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
      onReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Popover>
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
          {selectedColumns.map((columnId, index) => {
            const column = columns.find(col => col.id === columnId);
            if (!column) return null;
            
            return (
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
                  checked={selectedColumns.includes(column.id)}
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
            );
          })}
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
