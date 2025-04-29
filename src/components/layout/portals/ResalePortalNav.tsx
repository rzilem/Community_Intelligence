
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const resalePortalItems = [{
  name: 'Dashboard',
  path: '/resale-portal',
  icon: LayoutDashboard
}, {
  name: 'My Orders',
  path: '/resale-portal/my-orders',
  icon: FileText
}, {
  name: 'New Order',
  path: '/resale-portal/order',
  icon: FileText
}, {
  name: 'Account Settings',
  path: '/resale-portal/settings',
  icon: Users
}];

interface ResalePortalNavProps {
  currentPath: string;
}

const ResalePortalNav: React.FC<ResalePortalNavProps> = ({ currentPath }) => {
  return (
    <div className="mb-2 pb-2 border-b border-white/10">
      <p className="px-3 py-1 text-white/60 text-xs uppercase">Resale Portal</p>
      {resalePortalItems.map(item => (
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

export default ResalePortalNav;
