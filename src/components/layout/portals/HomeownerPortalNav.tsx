
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CreditCard, FileText, Calendar, Users, File } from 'lucide-react';
import { cn } from '@/lib/utils';

export const homeownerPortalItems = [{
  name: 'Dashboard',
  path: '/portal/homeowner',
  icon: LayoutDashboard
}, {
  name: 'Payments',
  path: '/portal/homeowner/payments',
  icon: CreditCard
}, {
  name: 'Requests',
  path: '/portal/homeowner/requests',
  icon: FileText
}, {
  name: 'Calendar & Events',
  path: '/portal/homeowner/calendar',
  icon: Calendar
}, {
  name: 'Directory',
  path: '/portal/homeowner/directory',
  icon: Users
}, {
  name: 'Documents',
  path: '/portal/homeowner/documents',
  icon: File
}];

interface HomeownerPortalNavProps {
  currentPath: string;
}

const HomeownerPortalNav: React.FC<HomeownerPortalNavProps> = ({ currentPath }) => {
  return (
    <div className="mb-2 pb-2 border-b border-white/10">
      <p className="px-3 py-1 text-white/60 text-xs uppercase">Homeowner Portal</p>
      {homeownerPortalItems.map(item => (
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

export default HomeownerPortalNav;
