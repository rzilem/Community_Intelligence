
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResidentFiltersProps {
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  associations: any[];
}

const ResidentFilters: React.FC<ResidentFiltersProps> = ({
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  associations
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-4">
      <Select value={filterAssociation} onValueChange={setFilterAssociation}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Associations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Associations</SelectItem>
          {associations && associations.length > 0 ? (
            associations.map((assoc) => (
              <SelectItem key={assoc.id} value={assoc.id}>
                {assoc.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No associations available</SelectItem>
          )}
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
          <SelectItem value="family">Family</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>More Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Export Owners
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = '/system/data-import-export'}>
            Import/Export Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ResidentFilters;
