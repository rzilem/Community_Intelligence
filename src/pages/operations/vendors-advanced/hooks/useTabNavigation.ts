
import { useState } from 'react';
import { VendorTab, VENDOR_TABS } from '../config/tab-constants';

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState<VendorTab>(VENDOR_TABS.SEARCH);

  return {
    activeTab,
    setActiveTab
  };
};
