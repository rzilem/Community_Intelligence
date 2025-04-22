import React, { useState } from 'react';
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Compliance } from '@/types/compliance-types';
import { useSupabaseUpdate } from '@/hooks/supabase/use-supabase-update';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ComplianceTableProps {
  issues: Compliance[];
  isLoading: boolean;
  error: any;
  onEdit: (issue: Compliance) => void;
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({ 
  issues, 
  isLoading, 
  error,
  onEdit
}) => {
  const updateIssue = useSupabaseUpdate<Compliance>('compliance_issues');
  
  const handleStatusChange = async (issue: Compliance, newStatus: 'open' | 'in-progress' | 'resolved' | 'escalated') => {
    try {
      await updateIssue.mutateAsync({ 
        id: issue.id, 
        data: { 
          status: newStatus,
          resolved_date: newStatus === 'resolved' ? new Date().toISOString() : null
        } 
      });
    } catch (error) {
      console.error('Error updating compliance issue status:', error);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'escalated':
        return <Badge variant="destructive">Escalated</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading compliance issues: {error.message}</p>
      </div>
    );
  }
  
  if (issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No compliance issues to display.</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Reported</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Fine Amount</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="capitalize">{issue.violation_type}</TableCell>
              <TableCell>{issue.property_id.substring(0, 8)}...</TableCell>
              <TableCell>
                {issue.description?.length > 30 
                  ? `${issue.description.substring(0, 30)}...` 
                  : issue.description}
              </TableCell>
              <TableCell>{getStatusBadge(issue.status)}</TableCell>
              <TableCell>{format(issue.created_at || '')}</TableCell>
              <TableCell>{issue.due_date ? format(issue.due_date) : 'N/A'}</TableCell>
              <TableCell className="text-right">{issue.fine_amount ? `$${issue.fine_amount}` : '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(issue)}>Edit Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuItem 
                      disabled={issue.status === 'open'}
                      onClick={() => handleStatusChange(issue, 'open')}
                    >
                      <Shield className="mr-2 h-4 w-4" /> Mark as Open
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={issue.status === 'in-progress'}
                      onClick={() => handleStatusChange(issue, 'in-progress')}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={issue.status === 'escalated'}
                      onClick={() => handleStatusChange(issue, 'escalated')}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" /> Escalate Issue
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={issue.status === 'resolved'}
                      onClick={() => handleStatusChange(issue, 'resolved')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
