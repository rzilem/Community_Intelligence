
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VendorAPIManagement from '@/components/vendors/api/VendorAPIManagement';
import { VENDOR_TABS } from '../config/tab-constants';

const APITab: React.FC = () => {
  return (
    <TabsContent value={VENDOR_TABS.API} className="space-y-6">
      <VendorAPIManagement />
    </TabsContent>
  );
};

export default APITab;
