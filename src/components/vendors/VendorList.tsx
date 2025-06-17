
import React, { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import ColumnSelector from "@/components/table/ColumnSelector";
import { useUserColumns } from "@/hooks/useUserColumns";
import VendorCardView from "./VendorCardView";
import VendorQuickFilters from "./VendorQuickFilters";
import VendorAdvancedFilters from "./VendorAdvancedFilters";
import VendorViewToggle from "./VendorViewToggle";
import VendorTable from "./VendorTable";
import VendorBulkActions from "./VendorBulkActions";
import BulkAddSpecialtiesDialog from "./BulkAddSpecialtiesDialog";
import { useVendorFilters } from "./hooks/useVendorFilters";
import { useVendorSelection } from "@/hooks/vendors/useVendorSelection";
import { COLUMN_OPTIONS } from "./constants/vendor-columns";
import { Vendor, VendorCategory } from "@/types/vendor-types";
import { vendorService } from "@/services/vendor-service";
import { useToast } from "@/hooks/use-toast";

interface VendorListProps {
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [bulkSpecialtiesOpen, setBulkSpecialtiesOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { 
    visibleColumnIds, 
    updateVisibleColumns,
    loading,
    error
  } = useUserColumns(COLUMN_OPTIONS, 'vendor-list');

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    advancedFilters,
    setAdvancedFilters,
    filteredVendors,
    hasActiveFilters,
    hasActiveAdvancedFilters,
    handleClearFilters,
    handleClearAdvancedFilters,
    sortConfig,
    handleSort,
    clearSort
  } = useVendorFilters(vendors);

  const {
    selectedVendorIds,
    selectedCount,
    toggleVendor,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate
  } = useVendorSelection(filteredVendors);

  const selectedVendors = filteredVendors.filter(vendor => selectedVendorIds.includes(vendor.id));

  const handleBulkAddSpecialties = async (specialties: VendorCategory[]) => {
    try {
      await vendorService.bulkAddSpecialties(selectedVendorIds, specialties);
      
      // Refresh the vendors query to show updated data
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      
      clearSelection();
      toast({
        title: "Specialties added successfully",
        description: `Added ${specialties.length} specialties to ${selectedCount} vendors.`,
      });
    } catch (error) {
      console.error('Error bulk adding specialties:', error);
      toast({
        title: "Error adding specialties",
        description: "Failed to add specialties to vendors. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle it
    }
  };

  if (error) {
    console.warn('Column preferences error:', error);
  }

  return (
    <div className="space-y-3">
      {/* Header with filters and view toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Vendors ({filteredVendors.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your vendor relationships and services
          </p>
        </div>
        <VendorViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Quick Filters */}
      <VendorQuickFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        specialtyFilter={specialtyFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        sortConfig={sortConfig}
        onClearSort={clearSort}
      />

      {/* Advanced Filters */}
      <VendorAdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onClearAdvanced={handleClearAdvancedFilters}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
        open={advancedFiltersOpen}
        onOpenChange={setAdvancedFiltersOpen}
      />

      {/* Bulk Actions Toolbar */}
      {view === 'table' && (
        <VendorBulkActions
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          onAddSpecialties={() => setBulkSpecialtiesOpen(true)}
        />
      )}

      {/* Results count and column selector for table view */}
      {view === 'table' && (
        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters || hasActiveAdvancedFilters ? `${filteredVendors.length} of ${vendors.length} vendors` : 'All vendors'}
            {selectedCount > 0 && ` • ${selectedCount} selected`}
            {sortConfig.key && ` • Sorted by ${sortConfig.key}`}
          </div>
          <ColumnSelector 
            columns={COLUMN_OPTIONS} 
            selectedColumns={visibleColumnIds} 
            onChange={updateVisibleColumns} 
          />
        </div>
      )}

      {/* Vendor List Content */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No vendors found</p>
          {(hasActiveFilters || hasActiveAdvancedFilters) && (
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or clearing them to see more results
            </p>
          )}
        </div>
      ) : view === 'cards' ? (
        <VendorCardView vendors={filteredVendors} />
      ) : (
        <VendorTable 
          vendors={filteredVendors} 
          visibleColumnIds={visibleColumnIds}
          selectedVendorIds={selectedVendorIds}
          onVendorSelect={toggleVendor}
          onSelectAll={toggleAll}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          showSelection={true}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )}

      {/* Bulk Add Specialties Dialog */}
      <BulkAddSpecialtiesDialog
        open={bulkSpecialtiesOpen}
        onOpenChange={setBulkSpecialtiesOpen}
        selectedVendors={selectedVendors}
        onConfirm={handleBulkAddSpecialties}
      />
    </div>
  );
};

export default React.memo(VendorList);
