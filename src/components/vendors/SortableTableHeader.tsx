
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SortDirection } from '@/hooks/vendors/useSortableTable';

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className
}) => {
  const isActive = currentSortKey === sortKey;
  
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={() => onSort(sortKey)}
        className="font-semibold text-gray-900 p-0 h-auto hover:bg-transparent justify-start"
      >
        {label}
        <div className="ml-1 flex flex-col">
          <ChevronUp 
            className={`h-3 w-3 transition-colors ${
              isActive && currentDirection === 'asc' 
                ? 'text-blue-600' 
                : 'text-gray-400'
            }`} 
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 transition-colors ${
              isActive && currentDirection === 'desc' 
                ? 'text-blue-600' 
                : 'text-gray-400'
            }`} 
          />
        </div>
      </Button>
    </TableHead>
  );
};

export default SortableTableHeader;
