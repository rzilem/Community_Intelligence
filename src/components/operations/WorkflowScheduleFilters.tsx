
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, FileDown, RefreshCw, PlusCircle } from 'lucide-react';

interface WorkflowScheduleFiltersProps {
  onRefresh: () => void;
  onFilterByType: (type: string) => void;
  onFilterByStatus: (status: string) => void;
  onSearch: (term: string) => void;
}

const WorkflowScheduleFilters: React.FC<WorkflowScheduleFiltersProps> = ({
  onRefresh,
  onFilterByType,
  onFilterByStatus,
  onSearch
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search workflows..." 
            className="pl-8" 
            onChange={(e) => onSearch(e.target.value)} 
          />
        </div>
        
        <Select onValueChange={onFilterByType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="file">File Processing</SelectItem>
            <SelectItem value="report">Reporting</SelectItem>
            <SelectItem value="sync">Data Sync</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="notification">Notifications</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={onFilterByStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
        
        <Button size="sm" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Workflow
        </Button>
      </div>
    </div>
  );
};

export default WorkflowScheduleFilters;
