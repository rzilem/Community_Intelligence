
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorStatusCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  return (
    <TableCell className={CELL_STYLES.default}>
      <Badge 
        variant={vendor.is_active ? "default" : "secondary"}
        className={vendor.is_active 
          ? "bg-green-100 text-green-800 border-green-200 text-xs" 
          : "bg-gray-100 text-gray-800 border-gray-200 text-xs"}
      >
        {vendor.is_active ? "Active" : "Inactive"}
      </Badge>
    </TableCell>
  );
};

export default VendorStatusCell;
