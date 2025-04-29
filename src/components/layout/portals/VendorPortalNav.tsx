
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const vendorPortalItems = [{
  name: 'Dashboard',
  path: '/portal/vendor',
  icon: LayoutDashboard
}, {
  name: 'Bids & Opportunities',
  path: '/portal/vendor/bids',
  icon: FileText
}, {
  name: 'Invoices & Payments',
  path: '/portal/vendor/invoices',
  icon: CreditCard
}, {
  name: 'Vendor Status',
  path: '/portal/vendor/status',
  icon: Star
}];

interface VendorPortalNavProps {
  currentPath: string;
}

const VendorPortalNav: React.FC<VendorPortalNavProps> = ({ currentPath }) => {
  return (
    <div className="mb-2 pb-2 border-b border-white/10">
      <p className="px-3 py-1 text-white/60 text-xs uppercase">Vendor Portal</p>
      {vendorPortalItems.map(item => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-md text-white hover:bg-white/10", 
            currentPath === item.path && "bg-white/10 font-medium"
          )}
        >
          <item.icon size={20} />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default VendorPortalNav;
