
import React, { useRef, useEffect } from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import SortableTableHeader from '../SortableTableHeader';
import { VendorTableHeaderProps } from './utils/vendor-table-types';
import { COLUMN_WIDTHS } from './utils/vendor-table-constants';

const VendorTableHeader: React.FC<VendorTableHeaderProps> = ({
  visibleColumnIds,
  showSelection = false,
  sortConfig = { key: '', direction: null },
  onSort,
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false
}) => {
  const selectAllRef = useRef<React.ElementRef<typeof Checkbox>>(null);

  // Set indeterminate state on the select all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      // Access the underlying input element within the Radix Checkbox
      const inputElement = selectAllRef.current.querySelector('input');
      if (inputElement) {
        inputElement.indeterminate = isIndeterminate;
      }
    }
  }, [isIndeterminate]);

  const renderHeaderCell = (columnId: string, label: string, sortKey?: string) => {
    const width = COLUMN_WIDTHS[columnId as keyof typeof COLUMN_WIDTHS];
    
    if (onSort && sortKey) {
      return (
        <SortableTableHeader
          label={label}
          sortKey={sortKey}
          currentSortKey={sortConfig.key}
          currentDirection={sortConfig.direction}
          onSort={onSort}
          className={width}
        />
      );
    }
    
    return (
      <TableHead className={`font-semibold text-gray-900 ${width}`}>
        {label}
      </TableHead>
    );
  };

  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        {showSelection && (
          <TableHead className={COLUMN_WIDTHS.selection}>
            <Checkbox
              ref={selectAllRef}
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all vendors"
            />
          </TableHead>
        )}
        {visibleColumnIds.includes('name') && renderHeaderCell('name', 'Vendor Name', 'name')}
        {visibleColumnIds.includes('contact_person') && renderHeaderCell('contact_person', 'Contact Person', 'contact_person')}
        {visibleColumnIds.includes('email') && renderHeaderCell('email', 'Email', 'email')}
        {visibleColumnIds.includes('phone') && renderHeaderCell('phone', 'Phone', 'phone')}
        {visibleColumnIds.includes('specialties') && renderHeaderCell('specialties', 'Specialties', 'specialties')}
        {visibleColumnIds.includes('is_active') && renderHeaderCell('is_active', 'Status', 'is_active')}
        {visibleColumnIds.includes('total_jobs') && renderHeaderCell('total_jobs', 'Jobs', 'total_jobs')}
        {visibleColumnIds.includes('rating') && renderHeaderCell('rating', 'Rating', 'rating')}
      </TableRow>
    </TableHeader>
  );
};

export default VendorTableHeader;
