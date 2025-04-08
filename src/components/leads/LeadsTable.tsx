
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

const LeadsTable = ({ leads, isLoading = false }: LeadsTableProps) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </TableCell>
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
