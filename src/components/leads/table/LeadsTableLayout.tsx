
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Lead } from '@/types/lead-types';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import AIProcessingControls from '../AIProcessingControls';

interface LeadsTableLayoutProps {
  leads: Lead[];
  isLoading?: boolean;
  columns: LeadColumn[];
  visibleColumnIds: string[];
  onUpdateVisibleColumns?: (columnIds: string[]) => void;
  onReorderColumns?: (startIndex: number, endIndex: number) => void;
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: Lead['status']) => void;
  onRefreshLeads?: () => void;
}

const LeadsTableLayout: React.FC<LeadsTableLayoutProps> = ({
  leads,
  isLoading,
  columns,
  visibleColumnIds,
  onViewDetails,
  onEditLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onRefreshLeads
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', variant: 'secondary' as const },
      contacted: { label: 'Contacted', variant: 'default' as const },
      qualified: { label: 'Qualified', variant: 'default' as const },
      proposal: { label: 'Proposal', variant: 'default' as const },
      converted: { label: 'Converted', variant: 'default' as const },
      lost: { label: 'Lost', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No leads found</p>
          <p className="text-sm text-gray-500">Leads will appear here once they are created or received.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Property Type</TableHead>
            <TableHead>AI Processing</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                {lead.company_name || 'Unknown Company'}
              </TableCell>
              <TableCell>{lead.contact_name || 'Not specified'}</TableCell>
              <TableCell>{lead.email || 'Not specified'}</TableCell>
              <TableCell>{lead.phone || 'Not specified'}</TableCell>
              <TableCell>
                {getStatusBadge(lead.status)}
              </TableCell>
              <TableCell>
                {lead.property_type ? (
                  <Badge variant="outline">
                    {lead.property_type.replace('_', ' ')}
                  </Badge>
                ) : (
                  'Not specified'
                )}
              </TableCell>
              <TableCell>
                <AIProcessingControls
                  lead={lead}
                  onProcessingComplete={() => onRefreshLeads?.()}
                  compact={true}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(lead)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditLead(lead)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteLead(lead.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Lead
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

export default LeadsTableLayout;
