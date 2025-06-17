
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorSpecialtiesCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  if (!vendor.specialties || vendor.specialties.length === 0) {
    return (
      <TableCell className={CELL_STYLES.default}>
        <span className="text-gray-400 text-sm">—</span>
      </TableCell>
    );
  }

  return (
    <TableCell className={CELL_STYLES.default}>
      <div className="flex flex-wrap gap-1">
        {vendor.specialties.slice(0, 3).map((specialty, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
          >
            {specialty}
          </Badge>
        ))}
        {vendor.specialties.length > 3 && (
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
          >
            +{vendor.specialties.length - 3}
          </Badge>
        )}
      </div>
    </TableCell>
  );
};

export default VendorSpecialtiesCell;
