
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorRatingCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  if (vendor.rating == null) {
    return (
      <TableCell className={CELL_STYLES.default}>
        <span className="text-gray-400 text-sm">No rating</span>
      </TableCell>
    );
  }

  return (
    <TableCell className={CELL_STYLES.default}>
      <div className="flex items-center gap-1">
        <span className="font-medium text-sm">{vendor.rating.toFixed(1)}</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={i < Math.floor(vendor.rating!) 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"} 
            />
          ))}
        </div>
      </div>
    </TableCell>
  );
};

export default VendorRatingCell;
