
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { CELL_STYLES } from '../utils/vendor-table-constants';

interface VendorSelectionCellProps {
  vendorId: string;
  vendorName: string;
  isSelected: boolean;
  onSelect: (vendorId: string) => void;
}

const VendorSelectionCell: React.FC<VendorSelectionCellProps> = ({ 
  vendorId, 
  vendorName, 
  isSelected, 
  onSelect 
}) => {
  return (
    <TableCell className={CELL_STYLES.default}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(vendorId)}
        aria-label={`Select ${vendorName}`}
      />
    </TableCell>
  );
};

export default VendorSelectionCell;
