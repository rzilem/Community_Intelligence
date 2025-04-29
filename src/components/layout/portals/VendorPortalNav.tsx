
import React from 'react';
import { cn } from '@/lib/utils';

interface VendorPortalNavProps {
  currentPath: string;
}

const VendorPortalNav: React.FC<VendorPortalNavProps> = () => {
  return (
    <div className="mb-2 pb-2 border-b border-white/10">
      <p className="px-3 py-1 text-white/60 text-xs uppercase">Vendor Portal</p>
      {/* Vendor portal items would go here once implemented */}
    </div>
  );
};

export default VendorPortalNav;
