
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, FlagOff } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Violation {
  id: string;
  violation_type: string;
  status: string;
  description?: string;
  issued_date: string;
  due_date?: string;
  fine_amount?: number;
}

const ViolationsTabContent = () => {
  const { data: violations = [], isLoading } = useSupabaseQuery<Violation[]>(
    'violations',
    {
      select: '*',
      order: { column: 'issued_date', ascending: false }
    }
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800 border-red-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      escalated: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return <Badge variant="outline" className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  if (isLoading) {
    return <div>Loading violations...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Fine Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {violations.map((violation) => (
            <TableRow key={violation.id}>
              <TableCell className="flex items-center gap-2">
                {violation.status === 'resolved' ? (
                  <FlagOff className="h-4 w-4" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                {violation.violation_type}
              </TableCell>
              <TableCell>{getStatusBadge(violation.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(violation.issued_date), { addSuffix: true })}</span>
                </div>
              </TableCell>
              <TableCell>
                {violation.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(violation.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {violation.fine_amount && (
                  <span>${violation.fine_amount.toFixed(2)}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ViolationsTabContent;
