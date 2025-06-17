
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VendorList from '@/components/vendors/VendorList';
import LoadingTabContent from '../components/LoadingTabContent';
import { Vendor } from '@/types/vendor-types';
import { VENDOR_TABS } from '../config/tab-constants';

interface VendorListTabProps {
  vendors: Vendor[];
  isLoading: boolean;
}

const VendorListTab: React.FC<VendorListTabProps> = ({ vendors, isLoading }) => {
  return (
    <TabsContent value={VENDOR_TABS.LIST} className="space-y-6">
      {isLoading ? (
        <LoadingTabContent />
      ) : (
        <VendorList vendors={vendors} />
      )}
    </TabsContent>
  );
};

export default VendorListTab;
