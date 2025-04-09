
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/types/lead-types';
import { renderLeadTableCell } from './lead-table-utils';
import { LeadColumn } from '@/hooks/leads/useTableColumns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle } from 'lucide-react';
import LeadTablePagination from './LeadTablePagination';
import LeadDetailDialog from './LeadDetailDialog';
import LeadColumnSelector from './LeadColumnSelector';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  columns: LeadColumn[];
  visibleColumnIds: string[];
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, status: Lead['status']) => void;
  onUpdateVisibleColumns?: (columnIds: string[]) => void;
  onReorderColumns?: (startIndex: number, endIndex: number) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  columns,
  visibleColumnIds,
  onDeleteLead,
  onUpdateLeadStatus,
  onUpdateVisibleColumns,
  onReorderColumns
}) => {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  
  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };
  
  const handleEditLead = (lead: Lead) => {
    navigate(`/lead-management/leads/${lead.id}`);
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leads...</div>;
  }
  
  return (
    <div>
      {onUpdateVisibleColumns && (
        <div className="flex justify-end mb-4">
          <LeadColumnSelector 
            columns={columns} 
            selectedColumns={visibleColumnIds} 
            onChange={onUpdateVisibleColumns} 
            onReorder={onReorderColumns}
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnIds.map(columnId => {
                const column = columns.find(col => col.id === columnId);
                return <TableHead key={columnId} className="">
                  {column?.label}
                </TableHead>;
              })}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnIds.length + 1} className="text-center py-8 text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map(lead => (
                <TableRow key={lead.id}>
                  {visibleColumnIds.map(columnId => (
                    <TableCell key={`${lead.id}-${columnId}`}>
                      {renderLeadTableCell(lead, columnId, columns)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateLeadStatus(lead.id, 'qualified')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Qualified
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteLead(lead.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {leads.length > 0 && (
          <div className="border-t p-2 flex justify-center">
            <LeadTablePagination totalPages={5} currentPage={1} onPageChange={() => {}} />
          </div>
        )}
        
        <LeadDetailDialog lead={selectedLead} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
      </div>
    </div>
  );
};

export default LeadsTable;
