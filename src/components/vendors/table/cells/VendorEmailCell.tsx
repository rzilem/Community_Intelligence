
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { VendorTableCellProps } from '../utils/vendor-table-types';
import { parseEmails } from '../utils/vendor-table-utils';
import { CELL_STYLES } from '../utils/vendor-table-constants';

const VendorEmailCell: React.FC<VendorTableCellProps> = ({ vendor }) => {
  const emails = parseEmails(vendor.email);
  
  if (emails.length === 0) {
    return (
      <TableCell className={CELL_STYLES.default}>
        <span className="text-gray-400">—</span>
      </TableCell>
    );
  }
  
  return (
    <TableCell className={CELL_STYLES.default}>
      <div className="flex flex-col space-y-1">
        {emails.map((email, index) => (
          <div key={index} className="block">
            <a 
              href={`mailto:${email}`} 
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
            >
              {email}
            </a>
          </div>
        ))}
      </div>
    </TableCell>
  );
};

export default VendorEmailCell;
