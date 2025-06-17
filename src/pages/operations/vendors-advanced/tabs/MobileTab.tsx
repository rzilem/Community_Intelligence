
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import MobileVendorWorkflow from '@/components/vendors/mobile/MobileVendorWorkflow';
import { VENDOR_TABS } from '../config/tab-constants';

interface MobileTabProps {
  onSave: (visitData: any) => void;
  onComplete: (visit: any) => void;
}

const MobileTab: React.FC<MobileTabProps> = ({ onSave, onComplete }) => {
  return (
    <TabsContent value={VENDOR_TABS.MOBILE} className="space-y-6">
      <div className="max-w-md mx-auto">
        <MobileVendorWorkflow 
          onSave={onSave}
          onComplete={onComplete}
        />
      </div>
    </TabsContent>
  );
};

export default MobileTab;
