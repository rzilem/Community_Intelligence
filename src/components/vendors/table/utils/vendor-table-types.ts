
import { Vendor } from '@/types/vendor-types';
import { SortConfig } from '@/hooks/vendors/useSortableTable';

export interface VendorTableCellProps {
  vendor: Vendor;
  isSelected?: boolean;
}

export interface VendorTableHeaderProps {
  visibleColumnIds: string[];
  showSelection?: boolean;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  selectedVendorIds?: string[];
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
}

export interface VendorTableBodyProps {
  vendors: Vendor[];
  visibleColumnIds: string[];
  selectedVendorIds?: string[];
  onVendorSelect?: (vendorId: string) => void;
  showSelection?: boolean;
}
