
import React from 'react';
import { TableRow } from '@/components/ui/table';
import { Vendor } from '@/types/vendor-types';
import VendorSelectionCell from './cells/VendorSelectionCell';
import VendorNameCell from './cells/VendorNameCell';
import VendorContactCell from './cells/VendorContactCell';
import VendorEmailCell from './cells/VendorEmailCell';
import VendorPhoneCell from './cells/VendorPhoneCell';
import VendorSpecialtiesCell from './cells/VendorSpecialtiesCell';
import VendorStatusCell from './cells/VendorStatusCell';
import VendorJobsCell from './cells/VendorJobsCell';
import VendorRatingCell from './cells/VendorRatingCell';

interface VendorTableRowProps {
  vendor: Vendor;
  visibleColumnIds: string[];
  isSelected?: boolean;
  onVendorSelect?: (vendorId: string) => void;
  showSelection?: boolean;
}

const VendorTableRow: React.FC<VendorTableRowProps> = ({
  vendor,
  visibleColumnIds,
  isSelected = false,
  onVendorSelect,
  showSelection = false
}) => {
  return (
    <TableRow 
      className={`hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      {showSelection && onVendorSelect && (
        <VendorSelectionCell
          vendorId={vendor.id}
          vendorName={vendor.name}
          isSelected={isSelected}
          onSelect={onVendorSelect}
        />
      )}
      {visibleColumnIds.includes('name') && <VendorNameCell vendor={vendor} />}
      {visibleColumnIds.includes('contact_person') && <VendorContactCell vendor={vendor} />}
      {visibleColumnIds.includes('email') && <VendorEmailCell vendor={vendor} />}
      {visibleColumnIds.includes('phone') && <VendorPhoneCell vendor={vendor} />}
      {visibleColumnIds.includes('specialties') && <VendorSpecialtiesCell vendor={vendor} />}
      {visibleColumnIds.includes('is_active') && <VendorStatusCell vendor={vendor} />}
      {visibleColumnIds.includes('total_jobs') && <VendorJobsCell vendor={vendor} />}
      {visibleColumnIds.includes('rating') && <VendorRatingCell vendor={vendor} />}
    </TableRow>
  );
};

export default VendorTableRow;
