
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResidentFilters from '../ResidentFilters';
import ResidentTable from '../ResidentTable';

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
  filteredResidents
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner Management</CardTitle>
        <CardDescription>View and manage all owners across your community associations.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResidentFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          filterAssociation={filterAssociation} 
          setFilterAssociation={setFilterAssociation} 
          filterStatus={filterStatus} 
          setFilterStatus={setFilterStatus} 
          filterType={filterType} 
          setFilterType={setFilterType} 
          associations={associations}
        />
        
        {loading ? (
          <div className="py-24 text-center text-muted-foreground">
            Loading owners...
          </div>
        ) : (
          <ResidentTable residents={filteredResidents} />
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredResidents.length} of {residents.length} owners
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidentContent;
