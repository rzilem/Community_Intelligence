
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Plus } from 'lucide-react';

interface JournalEntriesToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCreateClick: () => void;
}

const JournalEntriesToolbar: React.FC<JournalEntriesToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateClick
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> More Filters
        </Button>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>

        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" /> Create Entry
        </Button>
      </div>
    </div>
  );
};

export default JournalEntriesToolbar;
