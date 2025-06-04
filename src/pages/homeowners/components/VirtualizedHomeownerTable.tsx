
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FormattedResident } from '../hooks/types/resident-types';
import { residentVirtualizationService } from '../hooks/services/resident-virtualization-service';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface VirtualizedHomeownerTableProps {
  homeowners: FormattedResident[];
  visibleColumns: string[];
  loading?: boolean;
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
}

const VirtualizedHomeownerTable: React.FC<VirtualizedHomeownerTableProps> = ({
  homeowners,
  visibleColumns,
  loading,
  onToggleColumn,
  onResetColumns
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const containerHeight = 600; // Fixed height for virtualization
  const itemHeight = 72; // Height of each row

  const virtualizedData = residentVirtualizationService.calculateVisibleItems(
    homeowners,
    scrollTop,
    { containerHeight, itemHeight }
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const renderHomeownerRow = (homeowner: FormattedResident, index: number) => (
    <TableRow 
      key={homeowner.id} 
      className="hover:bg-muted/50"
      style={{ height: itemHeight }}
    >
      {visibleColumns.includes('name') && (
        <TableCell className="font-medium">{homeowner.name}</TableCell>
      )}
      {visibleColumns.includes('email') && (
        <TableCell>{homeowner.email}</TableCell>
      )}
      {visibleColumns.includes('phone') && (
        <TableCell>{homeowner.phone}</TableCell>
      )}
      {visibleColumns.includes('propertyAddress') && (
        <TableCell>{homeowner.propertyAddress}</TableCell>
      )}
      {visibleColumns.includes('type') && (
        <TableCell className="capitalize">{homeowner.type}</TableCell>
      )}
      {visibleColumns.includes('status') && (
        <TableCell>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            homeowner.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {homeowner.status}
          </span>
        </TableCell>
      )}
      {visibleColumns.includes('associationName') && (
        <TableCell>{homeowner.associationName}</TableCell>
      )}
      {visibleColumns.includes('moveInDate') && (
        <TableCell>{homeowner.moveInDate}</TableCell>
      )}
    </TableRow>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading homeowners...</div>
      </div>
    );
  }

  if (homeowners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No homeowners found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Column selector controls */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing {virtualizedData.visibleItems.length} of {homeowners.length} homeowners</span>
        <button 
          onClick={onResetColumns}
          className="text-blue-600 hover:text-blue-800"
        >
          Reset Columns
        </button>
      </div>

      {/* Virtualized table container */}
      <div className="border rounded-md">
        <div 
          ref={containerRef}
          className="overflow-auto"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          <div style={{ height: virtualizedData.totalHeight, position: 'relative' }}>
            <div 
              style={{ 
                transform: `translateY(${virtualizedData.offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
                    {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
                    {visibleColumns.includes('phone') && <TableHead>Phone</TableHead>}
                    {visibleColumns.includes('propertyAddress') && <TableHead>Property</TableHead>}
                    {visibleColumns.includes('type') && <TableHead>Type</TableHead>}
                    {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                    {visibleColumns.includes('associationName') && <TableHead>Association</TableHead>}
                    {visibleColumns.includes('moveInDate') && <TableHead>Move In Date</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {virtualizedData.visibleItems.map((homeowner, index) => 
                    renderHomeownerRow(homeowner, virtualizedData.startIndex + index)
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedHomeownerTable;
