
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, RotateCw } from 'lucide-react';
import { PrintJob } from '@/types/print-queue-types';

interface PrintJobsTableProps {
  jobs: PrintJob[];
  onDelete: (jobId: string) => void;
  onReprint: (jobId: string) => void;
  selectedJobs: string[];
  setSelectedJobs: (jobIds: string[]) => void;
}

const PrintJobsTable: React.FC<PrintJobsTableProps> = ({
  jobs,
  onDelete,
  onReprint,
  selectedJobs,
  setSelectedJobs,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    }
  };

  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'printing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Printing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedJobs.length === jobs.length && jobs.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Pages</TableHead>
            <TableHead>Copies</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                No print jobs in the queue.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={(checked) => handleSelectJob(job.id, !!checked)}
                    aria-label={`Select ${job.name}`}
                  />
                </TableCell>
                <TableCell>{job.name}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>{job.association_name}</TableCell>
                <TableCell>{job.pages}</TableCell>
                <TableCell>{job.copies}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{job.certified ? "Yes" : "No"}</TableCell>
                <TableCell className="flex gap-2">
                  {(job.status === 'completed' || job.status === 'failed') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReprint(job.id)}
                      aria-label="Reprint"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(job.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PrintJobsTable;
