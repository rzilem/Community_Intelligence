
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItemProps {
  name: string;
  path: string;
  icon: React.ElementType;
  isOpen: boolean;
  toggleSection: () => void;
  isActive: boolean;
  submenu?: {
    name: string;
    path: string;
    icon: React.ElementType;
  }[];
  showBadge?: boolean;
}

const SidebarNavItem: React.FC<NavItemProps> = ({
  name,
  path,
  icon: Icon,
  isOpen,
  toggleSection,
  isActive,
  submenu,
  showBadge = false
}) => {
  return (
    <div className="space-y-1">
      {submenu ? (
        <>
          <button
            onClick={toggleSection}
            className={cn(
              "w-full text-left flex items-center justify-between py-2 px-3 rounded-md",
              isOpen || isActive
                ? "bg-sidebar-accent text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon size={20} />
              <span>{name}</span>
            </div>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {(isOpen || isActive) && (
            <div className="pl-8 space-y-1">
              {submenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 text-sm rounded-md",
                    window.location.pathname === item.path
                      ? "bg-sidebar-accent text-white"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={path}
          className={cn(
            "w-full flex items-center gap-2 py-2 px-3 rounded-md",
            window.location.pathname === path
              ? "bg-sidebar-accent text-white"
              : "text-white/80 hover:bg-white/10"
          )}
        >
          <Icon size={20} />
          <span>{name}</span>
          {showBadge && <Badge className="ml-auto bg-sidebar-accent text-white">3</Badge>}
        </Link>
      )}
    </div>
  );
};

export default SidebarNavItem;
