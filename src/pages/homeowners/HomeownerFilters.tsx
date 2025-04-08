
import React from 'react';
import { Search, Download, PlusCircle, Columns } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import TooltipButton from '@/components/ui/tooltip-button';
import ColumnSelector from '@/components/table/ColumnSelector';

interface HomeownerFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  selectedColumns: string[];
  setSelectedColumns: (columns: string[]) => void;
  availableColumns: {id: string; label: string}[];
}

const HomeownerFilters: React.FC<HomeownerFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  selectedColumns,
  setSelectedColumns,
  availableColumns
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search homeowners..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Select value={filterAssociation} onValueChange={setFilterAssociation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Association" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Associations</SelectItem>
              <SelectItem value="Oakwood Heights">Oakwood Heights</SelectItem>
              <SelectItem value="Highland Towers">Highland Towers</SelectItem>
              <SelectItem value="Lakeside Community">Lakeside Community</SelectItem>
              <SelectItem value="Sunset Gardens">Sunset Gardens</SelectItem>
              <SelectItem value="Willow Creek Estates">Willow Creek Estates</SelectItem>
              <SelectItem value="Pine Valley Community">Pine Valley Community</SelectItem>
              <SelectItem value="Riverfront Towers">Riverfront Towers</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending-approval">Pending</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Owner Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="family-member">Family Member</SelectItem>
            </SelectContent>
          </Select>
          
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex gap-2">
          <ColumnSelector 
            columns={availableColumns}
            selectedColumns={selectedColumns}
            onChange={setSelectedColumns}
            className="hidden md:flex"
          />
          
          <TooltipButton tooltip="Export homeowners as CSV">
            <Download className="h-4 w-4 mr-2" /> Export
          </TooltipButton>
          
          <TooltipButton variant="default" tooltip="Add a new homeowner">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Homeowner
          </TooltipButton>
        </div>
      </div>
    </div>
  );
};

export default HomeownerFilters;
