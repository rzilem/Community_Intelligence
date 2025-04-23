
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntry } from '@/types/accounting-types'; 

interface JournalEntryTableProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onView: (entry: JournalEntry) => void;
}

const JournalEntryTable: React.FC<JournalEntryTableProps> = ({ entries, onEdit, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'posted':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'voided':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                <TableCell>{entry.entryNumber}</TableCell>
                <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                <TableCell className="text-right">
                  ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(entry.status)}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{entry.createdBy}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(entry)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {entry.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No journal entries found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JournalEntryTable;
