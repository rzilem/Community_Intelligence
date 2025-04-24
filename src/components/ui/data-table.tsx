
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

interface DataTableColumn {
  accessorKey: string;
  header: string;
  cell?: (info: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  isLoading?: boolean;
  noResultsMessage?: string; // Added noResultsMessage prop
}

export function DataTable({ columns, data, isLoading = false, noResultsMessage = "No results." }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {noResultsMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.accessorKey}`}>
                    {column.cell 
                      ? column.cell({ getValue: () => row[column.accessorKey], row: { original: row } }) 
                      : row[column.accessorKey] || '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
