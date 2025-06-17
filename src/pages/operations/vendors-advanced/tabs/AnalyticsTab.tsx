
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VendorPerformanceReports from '@/components/vendors/analytics/VendorPerformanceReports';
import { Vendor } from '@/types/vendor-types';
import { VENDOR_TABS } from '../config/tab-constants';

interface AnalyticsTabProps {
  vendors: Vendor[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ vendors }) => {
  return (
    <TabsContent value={VENDOR_TABS.ANALYTICS} className="space-y-6">
      <VendorPerformanceReports 
        vendors={vendors}
        dateRange={{
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        }}
      />
    </TabsContent>
  );
};

export default AnalyticsTab;
