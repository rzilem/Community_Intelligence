
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColumnSelector from '@/components/table/ColumnSelector';

interface HomeownerListFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  associations: any[];
  columns: any[];
  visibleColumnIds: string[];
  updateVisibleColumns: (selectedIds: string[]) => void;
  reorderColumns: (startIndex: number, endIndex: number) => void;
}

const HomeownerListFilters: React.FC<HomeownerListFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  associations,
  columns,
  visibleColumnIds,
  updateVisibleColumns,
  reorderColumns
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center mb-6 gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search owners..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <Select value={filterAssociation} onValueChange={setFilterAssociation}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Associations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Associations</SelectItem>
            {associations.map((assoc: any) => (
              <SelectItem key={assoc.id} value={assoc.id}>{assoc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="family">Family Member</SelectItem>
          </SelectContent>
        </Select>
        
        <ColumnSelector
          columns={columns}
          selectedColumns={visibleColumnIds}
          onChange={updateVisibleColumns}
          onReorder={reorderColumns}
          className="ml-1"
        />
      </div>
    </div>
  );
};

export default HomeownerListFilters;
