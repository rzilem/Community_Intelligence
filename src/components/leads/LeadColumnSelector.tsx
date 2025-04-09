
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Settings } from 'lucide-react';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadColumnSelectorProps {
  columns: LeadColumn[];
  visibleColumnIds: string[];
  updateVisibleColumns: (columnIds: string[]) => void;
  resetToDefaults: () => void;
}

const LeadColumnSelector: React.FC<LeadColumnSelectorProps> = ({
  columns,
  visibleColumnIds,
  updateVisibleColumns,
  resetToDefaults
}) => {
  return (
    <div className="flex gap-2 self-end sm:self-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={visibleColumnIds.includes(column.id)}
              onCheckedChange={(checked) => {
                const updatedColumns = checked
                  ? [...visibleColumnIds, column.id]
                  : visibleColumnIds.filter((id) => id !== column.id);
                updateVisibleColumns(updatedColumns);
              }}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuCheckboxItem
            className="border-t mt-2"
            onCheckedChange={() => resetToDefaults()}
          >
            Reset to defaults
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button size="sm" variant="outline" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        View Options
      </Button>
    </div>
  );
};

export default LeadColumnSelector;
