
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ExternalLink, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import LeadDetailDialog from './LeadDetailDialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  visibleColumnIds: string[];
  columns: Array<{ id: string; label: string; accessorKey?: string }>;
  onDeleteLead?: (id: string) => Promise<void>;
  onUpdateLeadStatus?: (id: string, status: Lead['status']) => Promise<void>;
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
  const leadsPerPage = 10;
  
  // Get only the columns that should be displayed
  const visibleColumns = columns.filter(col => visibleColumnIds.includes(col.id));

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

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };
  
  const handleDeleteLead = async (lead: Lead) => {
    if (!onDeleteLead) {
      toast.error("Delete functionality is not implemented yet");
      return;
    }
    
    try {
      await onDeleteLead(lead.id);
      toast.success(`Lead "${lead.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };
  
  const handleUpdateStatus = async (lead: Lead, status: Lead['status']) => {
    if (!onUpdateLeadStatus) {
      toast.error("Status update functionality is not implemented yet");
      return;
    }
    
    try {
      await onUpdateLeadStatus(lead.id, status);
      toast.success(`Lead status updated to ${status}`);
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };
  
  const getNextStatus = (currentStatus: Lead['status']): Lead['status'] => {
    const statusOrder: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  };
  
  const getPreviousStatus = (currentStatus: Lead['status']): Lead['status'] => {
    const statusOrder: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const previousIndex = currentIndex === 0 ? statusOrder.length - 1 : currentIndex - 1;
    return statusOrder[previousIndex];
  };

  return (
    <>
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
            {currentLeads.map((lead) => (
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewLead(lead)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(lead, getNextStatus(lead.status))}
                          className="flex items-center gap-2"
                        >
                          <ArrowUp className="h-4 w-4" />
                          Move to {getNextStatus(lead.status)}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(lead, getPreviousStatus(lead.status))}
                          className="flex items-center gap-2"
                        >
                          <ArrowDown className="h-4 w-4" />
                          Move to {getPreviousStatus(lead.status)}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteLead(lead)}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNumber = currentPage - 3 + i;
                  if (pageNumber > totalPages) pageNumber = totalPages - (5 - i - 1);
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      isActive={currentPage === pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <LeadDetailDialog 
        lead={selectedLead}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </>
  );
};

export default LeadsTable;
