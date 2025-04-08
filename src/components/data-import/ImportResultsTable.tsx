
import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ImportResultsTableProps {
  results: {
    success: boolean;
    totalProcessed: number;
    successfulImports: number;
    failedImports: number;
    details: Array<{
      status: 'success' | 'error' | 'warning';
      message: string;
    }>;
  };
  onImportAnother: () => void;
}

const ImportResultsTable: React.FC<ImportResultsTableProps> = ({ results, onImportAnother }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {results.success ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-orange-500" />
          )}
          <div>
            <CardTitle>Import {results.success ? 'Completed' : 'Completed with Issues'}</CardTitle>
            <CardDescription>
              {results.successfulImports} of {results.totalProcessed} records were imported successfully.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-md bg-muted p-4 text-center">
              <div className="text-2xl font-bold">{results.totalProcessed}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{results.successfulImports}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{results.failedImports}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={detail.status === 'success' ? 'default' : 'destructive'}>
                        {detail.status === 'success' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {detail.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{detail.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onImportAnother}>
              <RefreshCw className="h-4 w-4 mr-2" /> Import Another File
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download Results Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportResultsTable;
