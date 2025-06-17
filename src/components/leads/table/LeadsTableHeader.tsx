
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeadColumn } from '@/hooks/leads/useTableColumns';

interface LeadsTableHeaderProps {
  columns: LeadColumn[];
  visibleColumnIds: string[];
}

const LeadsTableHeader: React.FC<LeadsTableHeaderProps> = ({ columns, visibleColumnIds }) => {
  return (
    <TableHeader>
      <TableRow>
        {visibleColumnIds.map(columnId => {
          const column = columns.find(col => col.id === columnId);
          return (
            <TableHead key={columnId} className="">
              {column?.label}
            </TableHead>
          );
        })}
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default LeadsTableHeader;
