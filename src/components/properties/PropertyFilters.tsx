
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterAssociation: string;
  setFilterAssociation: (association: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
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
              <SelectItem value="Oakridge Estates">Oakridge Estates</SelectItem>
              <SelectItem value="Highland Towers">Highland Towers</SelectItem>
              <SelectItem value="Lakeside Community">Lakeside Community</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delinquent">Delinquent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
