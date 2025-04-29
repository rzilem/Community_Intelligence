
import { ElementType } from 'react';

export interface NavItemProps {
  name: string;
  path: string;
  icon: ElementType;
  isActive?: boolean;
  submenu?: {
    name: string;
    path: string;
    icon: ElementType;
  }[];
  showBadge?: boolean;
  badgeCount?: number;
}

export interface AppLayoutProps {
  children: React.ReactNode;
}
