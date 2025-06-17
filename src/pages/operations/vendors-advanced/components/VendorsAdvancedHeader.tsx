
import React from 'react';
import { Building2 } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import VendorStatsCards from '@/components/vendors/VendorStatsCards';
import { VendorStats } from '@/types/vendor-types';

interface VendorsAdvancedHeaderProps {
  vendorStats?: VendorStats;
  children: React.ReactNode;
}

const VendorsAdvancedHeader: React.FC<VendorsAdvancedHeaderProps> = ({
  vendorStats,
  children
}) => {
  return (
    <PageTemplate 
      title="Advanced Vendor Management" 
      icon={<Building2 className="h-8 w-8" />}
      description="AI-powered vendor relationship management with advanced analytics."
    >
      <div className="space-y-6">
        {vendorStats && <VendorStatsCards stats={vendorStats} />}
        {children}
      </div>
    </PageTemplate>
  );
};

export default VendorsAdvancedHeader;
