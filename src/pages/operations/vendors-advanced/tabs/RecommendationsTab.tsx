
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VendorRecommendationEngine from '@/components/vendors/recommendations/VendorRecommendationEngine';
import { Vendor } from '@/types/vendor-types';
import { VENDOR_TABS } from '../config/tab-constants';

interface RecommendationsTabProps {
  vendors: Vendor[];
  criteria: any;
  onCriteriaChange: (updates: any) => void;
  onSelectVendor: (vendorId: string) => void;
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  vendors,
  criteria,
  onCriteriaChange,
  onSelectVendor
}) => {
  return (
    <TabsContent value={VENDOR_TABS.RECOMMENDATIONS} className="space-y-6">
      <VendorRecommendationEngine
        vendors={vendors}
        criteria={criteria}
        onCriteriaChange={onCriteriaChange}
        onSelectVendor={onSelectVendor}
      />
    </TabsContent>
  );
};

export default RecommendationsTab;
