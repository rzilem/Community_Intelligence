
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileCheck, FileText } from 'lucide-react';
import { JournalEntry, JournalEntryDetail as JournalEntryDetailType } from '@/types/accounting-types';
import { LoadingState } from '@/components/ui/loading-state';
import { format } from 'date-fns';

interface JournalEntryDetailProps {
  entry: JournalEntry;
  isLoading?: boolean;
  onStatusChange?: (id: string, status: string) => void;
  onBack?: () => void;
  readOnly?: boolean;
}

export const JournalEntryDetail: React.FC<JournalEntryDetailProps> = ({
  entry,
  isLoading = false,
  onStatusChange,
  onBack,
  readOnly = false
}) => {
  if (isLoading) {
    return <LoadingState variant="spinner" text="Loading journal entry..." className="py-10" />;
  }

  if (!entry) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Journal Entry Not Found</h3>
            <p className="text-muted-foreground mt-2">The requested journal entry could not be found.</p>
            {onBack && (
              <Button onClick={onBack} className="mt-4">
                Back to Journal Entries
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDebits = entry.details?.reduce((sum, detail) => sum + parseFloat(detail.debit.toString() || '0'), 0) || 0;
  const totalCredits = entry.details?.reduce((sum, detail) => sum + parseFloat(detail.credit.toString() || '0'), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Journal Entry {entry.entryNumber || entry.reference}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {entry.entryDate || entry.date ? format(new Date(entry.entryDate || entry.date), 'MMMM d, yyyy') : 'No date'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={entry.status === 'posted' ? 'outline' : entry.status === 'reconciled' ? 'default' : 'secondary'}
            className={
              entry.status === 'posted' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : entry.status === 'reconciled'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }
          >
            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
          </Badge>
          
          {!isBalanced && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unbalanced
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Journal Entry Details */}
          <div>
            <h3 className="text-sm font-medium mb-2">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-medium">{entry.reference || entry.entryNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="font-medium">{entry.description || 'No description'}</p>
              </div>
            </div>
          </div>
          
          {/* Journal Entry Line Items */}
          <div>
            <h3 className="text-sm font-medium mb-2">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.details && entry.details.length > 0 ? (
                  entry.details.map((detail, index) => (
                    <TableRow key={detail.id || index}>
                      <TableCell className="font-medium">
                        {detail.gl_account_id}
                      </TableCell>
                      <TableCell>{detail.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        {detail.debit ? `$${parseFloat(detail.debit.toString()).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.credit ? `$${parseFloat(detail.credit.toString()).toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No line items found
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="font-medium">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${totalDebits.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${totalCredits.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Actions */}
          {!readOnly && (
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <div className="space-x-2">
                {entry.status === 'draft' && onStatusChange && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!isBalanced}
                    onClick={() => onStatusChange(entry.id!, 'posted')}
                  >
                    <FileCheck className="h-4 w-4 mr-1" />
                    Post Journal Entry
                  </Button>
                )}
                {entry.status === 'posted' && onStatusChange && (
                  <Button
                    onClick={() => onStatusChange(entry.id!, 'reconciled')}
                  >
                    Mark as Reconciled
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
