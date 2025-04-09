
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  status: 'draft' | 'posted' | 'reconciled';
  createdBy: string;
  createdAt: string;
}

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
      case 'reconciled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
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
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell>{entry.reference}</TableCell>
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
          ))}
          {entries.length === 0 && (
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
