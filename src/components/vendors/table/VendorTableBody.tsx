
import React from 'react';
import { TableBody } from '@/components/ui/table';
import VendorTableRow from './VendorTableRow';
import { VendorTableBodyProps } from './utils/vendor-table-types';

const VendorTableBody: React.FC<VendorTableBodyProps> = ({
  vendors,
  visibleColumnIds,
  selectedVendorIds = [],
  onVendorSelect,
  showSelection = false
}) => {
  return (
    <TableBody>
      {vendors.map((vendor) => (
        <VendorTableRow
          key={vendor.id}
          vendor={vendor}
          visibleColumnIds={visibleColumnIds}
          isSelected={selectedVendorIds.includes(vendor.id)}
          onVendorSelect={onVendorSelect}
          showSelection={showSelection}
        />
      ))}
    </TableBody>
  );
};

export default VendorTableBody;
