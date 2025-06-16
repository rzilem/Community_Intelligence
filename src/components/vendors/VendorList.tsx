
import React, { useState } from "react";
import ColumnSelector from "@/components/table/ColumnSelector";
import { useUserColumns } from "@/hooks/useUserColumns";
import VendorCardView from "./VendorCardView";
import VendorQuickFilters from "./VendorQuickFilters";
import VendorViewToggle from "./VendorViewToggle";
import VendorTable from "./VendorTable";
import { useVendorFilters } from "./hooks/useVendorFilters";
import { COLUMN_OPTIONS } from "./constants/vendor-columns";
import { Vendor } from "@/types/vendor-types";

interface VendorListProps {
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  const [view, setView] = useState<'table' | 'cards'>('table');

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
    filteredVendors,
    hasActiveFilters,
    handleClearFilters
  } = useVendorFilters(vendors);

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
      />

      {/* Results count and column selector for table view */}
      {view === 'table' && (
        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? `${filteredVendors.length} of ${vendors.length} vendors` : 'All vendors'}
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
          {hasActiveFilters && (
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or clearing them to see more results
            </p>
          )}
        </div>
      ) : view === 'cards' ? (
        <VendorCardView vendors={filteredVendors} />
      ) : (
        <VendorTable vendors={filteredVendors} visibleColumnIds={visibleColumnIds} />
      )}
    </div>
  );
};

export default React.memo(VendorList);
