
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

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
            <th key={columnId} className="py-3 px-4 text-left font-medium text-sm text-muted-foreground">
              {column.label}
            </th>
          ) : null;
        })}
        <th className="py-3 px-4 text-right font-medium text-sm text-muted-foreground">Actions</th>
      </tr>
    </thead>
  );
};

export default RequestTableHeader;
