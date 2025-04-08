
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataPreviewTableProps {
  fileColumns: string[];
  previewData: any[];
  totalRows: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ fileColumns, previewData, totalRows }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Data Preview:</h3>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fileColumns.map(column => (
                <TableHead key={column} className="whitespace-nowrap">{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, index) => (
              <TableRow key={index}>
                {fileColumns.map(column => (
                  <TableCell key={`${index}-${column}`} className="truncate max-w-[200px]">
                    {row[column] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Showing first {previewData.length} of {totalRows} rows
      </p>
    </div>
  );
};

export default DataPreviewTable;
