
import React from 'react';
import { TableCell } from '@/components/ui/table';
import PhoneLink from '@/components/ui/phone-link';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorPhoneCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  return (
    <TableCell className={CELL_STYLES.whitespace}>
      {vendor.phone ? (
        <PhoneLink phone={vendor.phone} />
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </TableCell>
  );
};

export default VendorPhoneCell;
