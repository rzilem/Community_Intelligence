
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, WrenchIcon, PiggyBank, Users, 
  Building, BarChart, AlertTriangle, CheckSquare, Mail, 
  BookOpen, Video, Sparkles, DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const boardPortalItems = [{
  name: 'Dashboard',
  path: '/portal/board/dashboard',
  icon: LayoutDashboard
}, {
  name: 'Invoices',
  path: '/portal/board/invoices',
  icon: CreditCard
}, {
  name: 'Work Orders',
  path: '/portal/board/work-orders',
  icon: WrenchIcon
}, {
  name: 'Collections',
  path: '/portal/board/collections',
  icon: PiggyBank
}, {
  name: 'Homeowners',
  path: '/portal/board/homeowners',
  icon: Users
}, {
  name: 'Bank Accounts',
  path: '/portal/board/bank-accounts',
  icon: Building
}, {
  name: 'Reports',
  path: '/portal/board/reports',
  icon: BarChart
}, {
  name: 'Violations',
  path: '/portal/board/violations',
  icon: AlertTriangle
}, {
  name: 'Board Tasks',
  path: '/portal/board/tasks',
  icon: CheckSquare
}, {
  name: 'Email Community',
  path: '/portal/board/email',
  icon: Mail
}, {
  name: 'Board Portal Training',
  path: '/portal/board/training',
  icon: BookOpen
}, {
  name: 'Board Member Video Education',
  path: '/portal/board/video-education',
  icon: Video
}, {
  name: 'Board Member AI Assistant',
  path: '/portal/board/ai-assistant',
  icon: Sparkles
}, {
  name: 'Board Reimbursement',
  path: '/portal/board/reimbursement',
  icon: DollarSign
}];

interface BoardPortalNavProps {
  currentPath: string;
}

const BoardPortalNav: React.FC<BoardPortalNavProps> = ({ currentPath }) => {
  return (
    <div className="mb-2 pb-2 border-b border-white/10">
      <p className="px-3 py-1 text-white/60 text-xs uppercase">Board Portal</p>
      {boardPortalItems.map(item => (
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

export default BoardPortalNav;
