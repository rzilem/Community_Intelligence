
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Lead } from '@/types/lead-types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import LeadDetailDialog from './LeadDetailDialog';
import LeadActionsMenu from './LeadActionsMenu';
import LeadTablePagination from './LeadTablePagination';
import { renderLeadTableCell } from './lead-table-utils';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  visibleColumnIds: string[];
  columns: Array<{ id: string; label: string; accessorKey?: string }>;
  onDeleteLead?: (id: string) => Promise<void>;
  onUpdateLeadStatus?: (id: string, status: Lead['status']) => Promise<void>;
}

const LeadsTable = ({ 
  leads, 
  isLoading = false, 
  visibleColumnIds, 
  columns,
  onDeleteLead,
  onUpdateLeadStatus
}: LeadsTableProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const leadsPerPage = 10;
  
  // Get only the columns that should be displayed
  const visibleColumns = columns.filter(col => visibleColumnIds.includes(col.id));
  console.log("LeadsTable: filtered visible columns:", visibleColumns);

  // Calculate pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);
  
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

  const handleViewLead = (lead: Lead) => {
    // Navigate to the lead detail page instead of showing a dialog
    navigate(`/lead-management/leads/${lead.id}`);
  };
  
  const handleDeleteLead = async (lead: Lead) => {
    if (onDeleteLead) {
      await onDeleteLead(lead.id);
    }
  };
  
  const handleUpdateStatus = async (lead: Lead, status: Lead['status']) => {
    if (onUpdateLeadStatus) {
      await onUpdateLeadStatus(lead.id, status);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
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
            {currentLeads.map((lead) => (
              <TableRow key={lead.id}>
                {visibleColumns.map((column) => {
                  return (
                    <TableCell 
                      key={`${lead.id}-${column.id}`}
                      className={column.id === 'name' ? 'font-medium' : ''}
                    >
                      {renderLeadTableCell(lead, column.id, columns)}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewLead(lead)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <LeadActionsMenu 
                      lead={lead}
                      onDelete={handleDeleteLead}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <LeadTablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default LeadsTable;
