
import { Search, TrendingUp, Smartphone, BarChart, Settings, Building2 } from 'lucide-react';

export const VENDOR_TABS = {
  SEARCH: 'search',
  RECOMMENDATIONS: 'recommendations',
  MOBILE: 'mobile',
  ANALYTICS: 'analytics',
  API: 'api',
  LIST: 'list'
} as const;

export type VendorTab = typeof VENDOR_TABS[keyof typeof VENDOR_TABS];

export const TAB_CONFIG = [
  {
    value: VENDOR_TABS.SEARCH,
    label: 'Advanced Search',
    icon: Search
  },
  {
    value: VENDOR_TABS.RECOMMENDATIONS,
    label: 'AI Recommendations',
    icon: TrendingUp
  },
  {
    value: VENDOR_TABS.MOBILE,
    label: 'Mobile Tools',
    icon: Smartphone
  },
  {
    value: VENDOR_TABS.ANALYTICS,
    label: 'Analytics',
    icon: BarChart
  },
  {
    value: VENDOR_TABS.API,
    label: 'API & Data',
    icon: Settings
  },
  {
    value: VENDOR_TABS.LIST,
    label: 'Vendor List',
    icon: Building2
  }
];
