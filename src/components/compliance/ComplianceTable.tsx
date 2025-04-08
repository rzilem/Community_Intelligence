
import React from 'react';
import { Compliance } from '@/types/app-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Shield, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseUpdate } from '@/hooks/supabase';

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
  
  const handleStatusChange = async (issue: Compliance, newStatus: 'open' | 'escalated' | 'resolved') => {
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
      case 'escalated':
        return <Badge variant="destructive">Escalated</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
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
              <TableCell>{formatDate(issue.created_at || '')}</TableCell>
              <TableCell>{issue.due_date ? formatDate(issue.due_date) : 'N/A'}</TableCell>
              <TableCell className="text-right">{issue.fine_amount ? `$${issue.fine_amount}` : '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
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
