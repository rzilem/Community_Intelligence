
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users2 } from 'lucide-react';
import { toast } from 'sonner';
import ResidentActions from './components/ResidentActions';
import ResidentContent from './components/ResidentContent';
import { useResidentsData } from './hooks/useResidentsData';
import { useResidentFilters } from './hooks/useResidentFilters';

const ResidentListPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { residents, loading, associations, fetchResidentsData } = useResidentsData();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterAssociation, 
    setFilterAssociation, 
    filterStatus, 
    setFilterStatus, 
    filterType, 
    setFilterType, 
    filteredResidents 
  } = useResidentFilters(residents);
  
  const handleAddSuccess = (newOwner) => {
    setIsAddDialogOpen(false);
    toast.success('Owner added successfully');
    // Immediately reload the resident list to show the new owner
    fetchResidentsData();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Owners</h1>
          </div>
          
          <ResidentActions 
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            onAddSuccess={handleAddSuccess}
          />
        </div>

        <ResidentContent
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterAssociation={filterAssociation}
          setFilterAssociation={setFilterAssociation}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
          associations={associations}
          residents={residents}
          filteredResidents={filteredResidents}
        />
      </div>
    </AppLayout>
  );
};

export default ResidentListPage;
