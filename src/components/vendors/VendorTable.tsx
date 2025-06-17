
import React from "react";
import { Table } from "@/components/ui/table";
import { Vendor } from "@/types/vendor-types";
import { SortConfig } from "@/hooks/vendors/useSortableTable";
import VendorTableHeader from "./table/VendorTableHeader";
import VendorTableBody from "./table/VendorTableBody";

interface VendorTableProps {
  vendors: Vendor[];
  visibleColumnIds: string[];
  selectedVendorIds?: string[];
  onVendorSelect?: (vendorId: string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  showSelection?: boolean;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

const VendorTable: React.FC<VendorTableProps> = ({ 
  vendors, 
  visibleColumnIds,
  selectedVendorIds = [],
  onVendorSelect,
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
  showSelection = false,
  sortConfig = { key: '', direction: null },
  onSort
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <VendorTableHeader
          visibleColumnIds={visibleColumnIds}
          showSelection={showSelection}
          sortConfig={sortConfig}
          onSort={onSort}
          onSelectAll={onSelectAll}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
        />
        <VendorTableBody
          vendors={vendors}
          visibleColumnIds={visibleColumnIds}
          selectedVendorIds={selectedVendorIds}
          onVendorSelect={onVendorSelect}
          showSelection={showSelection}
        />
      </Table>
    </div>
  );
};

export default VendorTable;
