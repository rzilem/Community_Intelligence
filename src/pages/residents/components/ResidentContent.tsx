
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ResidentTable from './ResidentTable';
import ResidentFilters from './ResidentFilters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ResidentContentProps {
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  associations: any[];
  residents: any[];
  filteredResidents: any[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ResidentContent: React.FC<ResidentContentProps> = ({
  loading,
  searchTerm,
  setSearchTerm,
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  associations,
  residents,
  filteredResidents,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  // Count residents with invalid associations
  const invalidAssociationCount = residents.filter(
    resident => !resident.hasValidAssociation
  ).length;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-2">Owner Management</h2>
        <p className="text-muted-foreground mb-6">
          View and manage all owners across your community associations.
        </p>

        {invalidAssociationCount > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Association Issues Detected</AlertTitle>
            <AlertDescription>
              {invalidAssociationCount} owners have invalid or missing association assignments. 
              Please use the import tools to fix these data issues.
            </AlertDescription>
          </Alert>
        )}
        
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
          
          <ResidentFilters
            filterAssociation={filterAssociation}
            setFilterAssociation={setFilterAssociation}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            associations={associations}
          />
        </div>
        
        <ResidentTable 
          loading={loading}
          residents={filteredResidents}
          totalCount={residents.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
};

export default ResidentContent;
