
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataPreviewTableProps {
  data: any[];
  highlightedColumns?: string[];
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ data, highlightedColumns = [] }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No data to preview</div>;
  }

  // Get all possible column names from the data
  const columnNames = React.useMemo(() => {
    const columns = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => columns.add(key));
    });
    return Array.from(columns);
  }, [data]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">#</TableHead>
          {columnNames.map(column => (
            <TableHead 
              key={column}
              className={cn(
                highlightedColumns && highlightedColumns.includes(column) 
                  ? 'bg-primary/10 font-medium'
                  : ''
              )}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell className="font-medium">{rowIndex + 1}</TableCell>
            {columnNames.map(column => (
              <TableCell 
                key={`${rowIndex}-${column}`}
                className={cn(
                  highlightedColumns && highlightedColumns.includes(column)
                    ? 'bg-primary/5'
                    : ''
                )}
              >
                {row[column] !== undefined ? String(row[column]) : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataPreviewTable;
