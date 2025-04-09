
import React from 'react';
import { Plus, FileUp, History, FileDown, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TooltipButton from '@/components/ui/tooltip-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface InvoiceToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddInvoice: () => void;
  onRefresh: () => void;
  onFilterChange: (filter: string) => void;
}

const InvoiceToolbar: React.FC<InvoiceToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onAddInvoice,
  onRefresh,
  onFilterChange,
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <TooltipButton tooltip="Add a new invoice" onClick={onAddInvoice}>
            <Plus className="h-4 w-4 mr-1" /> Add Invoice
          </TooltipButton>
          <TooltipButton variant="outline" tooltip="Import invoices from a CSV">
            <FileUp className="h-4 w-4 mr-1" /> Import
          </TooltipButton>
          <TooltipButton variant="outline" tooltip="Refresh invoice list" onClick={onRefresh}>
            <History className="h-4 w-4 mr-1" /> Refresh
          </TooltipButton>
        </div>
        <div className="flex gap-2">
          <TooltipButton variant="outline" tooltip="View invoice approval history">
            <History className="h-4 w-4 mr-1" /> History
          </TooltipButton>
          <TooltipButton variant="outline" tooltip="Export the invoice queue as CSV">
            <FileDown className="h-4 w-4 mr-1" /> Export
          </TooltipButton>
        </div>
      </div>
    
      <div className="mt-4 flex justify-between items-center">
        <div className="relative w-80">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onFilterChange('all-invoices')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('pending')}>
              Pending Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('approved')}>
              Approved Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('rejected')}>
              Rejected Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('paid')}>
              Paid Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default InvoiceToolbar;
