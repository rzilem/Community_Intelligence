
import React, { useState, useEffect } from 'react';
import { Users2 } from 'lucide-react';
import { toast } from 'sonner';
import ResidentActions from './components/ResidentActions';
import ResidentContent from './components/ResidentContent';
import { useResidentsData } from './hooks/useResidentsData';
import { useResidentFilters } from './hooks/useResidentFilters';

const ResidentListPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const { 
    residents, 
    loading, 
    associations, 
    fetchResidentsData, 
    exportResidentsAsCSV, 
    exportResidentsAsPDF 
  } = useResidentsData();
  
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
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAssociation, filterStatus, filterType]);
  
  const handleAddSuccess = (newOwner) => {
    setIsAddDialogOpen(false);
    toast.success('Owner added successfully');
    // Immediately reload the resident list to show the new owner
    fetchResidentsData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the table when changing pages
    window.scrollTo({
      top: document.getElementById('resident-table-top')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
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
          onExportCSV={exportResidentsAsCSV}
          onExportPDF={exportResidentsAsPDF}
        />
      </div>

      <div id="resident-table-top"></div>
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
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ResidentListPage;
