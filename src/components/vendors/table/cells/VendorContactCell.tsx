
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorContactCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  return (
    <TableCell className={CELL_STYLES.text}>
      {vendor.contact_person || <span className="text-gray-400">—</span>}
    </TableCell>
  );
};

export default VendorContactCell;
