
import React from 'react';
import { Search, Filter, Download, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';
import { PaymentFilterProps } from '@/types/transaction-payment-types';

const PaymentFilters: React.FC<PaymentFilterProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TooltipButton tooltip="Export payments as CSV">
          <Download className="h-4 w-4 mr-2" /> Export
        </TooltipButton>
        <TooltipButton variant="default" tooltip="Create a new payment">
          <PlusCircle className="h-4 w-4 mr-2" /> New Payment
        </TooltipButton>
      </div>
    </div>
  );
};

export default PaymentFilters;
