
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WorkflowFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const WorkflowFilters: React.FC<WorkflowFiltersProps> = ({
  searchTerm,
  onSearchChange
}) => (
  <div className="relative max-w-sm">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search workflows..."
      className="pl-8"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  </div>
);
