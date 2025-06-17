
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorJobsCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  return (
    <TableCell className={`${CELL_STYLES.text} font-medium`}>
      {vendor.total_jobs || 0}
    </TableCell>
  );
};

export default VendorJobsCell;
