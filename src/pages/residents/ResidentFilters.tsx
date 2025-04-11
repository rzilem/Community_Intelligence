
import React from 'react';
import { Search, Download, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddOwnerForm from './AddOwnerForm';

interface ResidentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
}

const ResidentFilters: React.FC<ResidentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const handleAddSuccess = (newOwner) => {
    // Placeholder for potential list update logic
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search owners..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
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
        </div>
        
        <div className="flex gap-2">
          <TooltipButton tooltip="Export owners as CSV">
            <Download className="h-4 w-4 mr-2" /> Export
          </TooltipButton>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <TooltipButton 
                variant="default" 
                tooltip="Add a new owner"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" /> Add Owner
              </TooltipButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Owner</DialogTitle>
              </DialogHeader>
              <AddOwnerForm 
                onSuccess={handleAddSuccess} 
                onCancel={() => setIsAddDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ResidentFilters;
