
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HomeownerRequestColumn } from '@/types/homeowner-request-types';

interface RequestTableHeaderProps {
  columns: HomeownerRequestColumn[];
  visibleColumnIds: string[];
}

const RequestTableHeader: React.FC<RequestTableHeaderProps> = ({ columns, visibleColumnIds }) => {
  return (
    <TableHeader>
      <TableRow>
        {visibleColumnIds.map((columnId) => {
          const column = columns.find(col => col.id === columnId);
          return column ? (
            <TableHead key={columnId}>{column.label}</TableHead>
          ) : null;
        })}
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default RequestTableHeader;
