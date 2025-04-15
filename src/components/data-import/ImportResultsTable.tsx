
import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Download, ExternalLink, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ImportResult } from '@/types/import-types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ImportResultsTableProps {
  results: ImportResult;
  onImportAnother: () => void;
  associationId: string;
}

const ImportResultsTable: React.FC<ImportResultsTableProps> = ({ results, onImportAnother, associationId }) => {
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
                      <Badge variant={detail.status === 'success' ? 'default' : detail.status === 'warning' ? 'outline' : 'destructive'}>
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

          {results.job_id && (
            <Collapsible className="border rounded p-4">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="font-medium">View Job Details</div>
                  <Button variant="ghost" size="sm">
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="text-sm">
                  <div><strong>Job ID:</strong> {results.job_id}</div>
                  <div><strong>Total Processed:</strong> {results.totalProcessed}</div>
                  <div><strong>Successful:</strong> {results.successfulImports}</div>
                  <div><strong>Failed:</strong> {results.failedImports}</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={onImportAnother}>
              <RefreshCw className="h-4 w-4 mr-2" /> Import Another File
            </Button>
            <div className="flex gap-2">
              {results.job_id && (
                <Button variant="outline" asChild>
                  <Link to={`/system/import-jobs/${results.job_id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" /> View Full Details
                  </Link>
                </Button>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download Results Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportResultsTable;
