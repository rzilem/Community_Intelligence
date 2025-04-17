
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';
import { Separator } from '@/components/ui/separator';

interface RequestTableHeaderProps {
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
}

const RequestTableHeader: React.FC<RequestTableHeaderProps> = ({ columns, visibleColumnIds }) => {
  return (
    <thead className="bg-muted/50">
      <tr>
        {visibleColumnIds.map((columnId) => {
          const column = columns.find(col => col.id === columnId);
          return column ? (
            <th 
              key={columnId} 
              className="py-3 px-4 text-left font-medium text-sm text-muted-foreground border-r border-border/20 last:border-r-0"
            >
              {column.label}
            </th>
          ) : null;
        })}
        <th className="py-3 px-4 text-center font-medium text-sm text-muted-foreground relative">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default RequestTableHeader;
