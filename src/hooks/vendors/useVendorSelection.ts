
import { useState, useCallback } from 'react';
import { Vendor } from '@/types/vendor-types';

export function useVendorSelection(vendors: Vendor[]) {
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set());

  const toggleVendor = useCallback((vendorId: string) => {
    setSelectedVendorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedVendorIds.size === vendors.length) {
      setSelectedVendorIds(new Set());
    } else {
      setSelectedVendorIds(new Set(vendors.map(v => v.id)));
    }
  }, [vendors, selectedVendorIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedVendorIds(new Set());
  }, []);

  const isSelected = useCallback((vendorId: string) => {
    return selectedVendorIds.has(vendorId);
  }, [selectedVendorIds]);

  const isAllSelected = vendors.length > 0 && selectedVendorIds.size === vendors.length;
  const isIndeterminate = selectedVendorIds.size > 0 && selectedVendorIds.size < vendors.length;

  return {
    selectedVendorIds: Array.from(selectedVendorIds),
    selectedCount: selectedVendorIds.size,
    toggleVendor,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate
  };
}
