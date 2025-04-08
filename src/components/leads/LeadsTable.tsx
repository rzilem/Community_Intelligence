
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Lead } from '@/types/lead-types';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  visibleColumnIds: string[];
  columns: Array<{ id: string; label: string; accessorKey?: string }>;
}

const LeadStatusBadge = ({ status }: { status: Lead['status'] }) => {
  const variants: Record<Lead['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    new: { variant: "default", label: "New" },
    contacted: { variant: "secondary", label: "Contacted" },
    qualified: { variant: "default", label: "Qualified" },
    proposal: { variant: "secondary", label: "Proposal Sent" },
    converted: { variant: "outline", label: "Converted" },
    lost: { variant: "destructive", label: "Lost" }
  };
  
  const { variant, label } = variants[status];
  
  return (
    <Badge variant={variant}>{label}</Badge>
  );
};

const LeadsTable = ({ leads, isLoading = false, visibleColumnIds, columns }: LeadsTableProps) => {
  // Get only the columns that should be displayed
  const visibleColumns = columns.filter(col => visibleColumnIds.includes(col.id));

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No leads found. Create a test lead or wait for incoming emails.</p>
      </div>
    );
  }

  // Helper function to render a cell based on column ID
  const renderCell = (lead: Lead, columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    
    if (!column || !column.accessorKey) return null;
    
    const value = lead[column.accessorKey as keyof Lead];
    
    if (column.id === 'status' && value) {
      return <LeadStatusBadge status={value as Lead['status']} />;
    }
    
    if (column.id === 'created_at' && value) {
      return formatDistanceToNow(new Date(value as string), { addSuffix: true });
    }
    
    if (column.id === 'updated_at' && value) {
      return formatDistanceToNow(new Date(value as string), { addSuffix: true });
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value as React.ReactNode;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead key={column.id}>{column.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              {visibleColumns.map((column) => (
                <TableCell 
                  key={`${lead.id}-${column.id}`}
                  className={column.id === 'name' ? 'font-medium' : ''}
                >
                  {renderCell(lead, column.id)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
