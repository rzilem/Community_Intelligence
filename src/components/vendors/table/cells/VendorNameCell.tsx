
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorNameCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  return (
    <TableCell className={CELL_STYLES.withFont}>
      <Link 
        to={`/operations/vendors/${vendor.id}`} 
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold transition-colors"
      >
        {vendor.name}
      </Link>
    </TableCell>
  );
};

export default VendorNameCell;
