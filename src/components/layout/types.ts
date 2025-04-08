
import { ReactElement } from 'react';

export interface NavItemProps {
  name: string;
  path: string;
  icon: React.ElementType;
  submenu?: {
    name: string;
    path: string;
    icon: React.ElementType;
  }[];
}

export interface AppLayoutProps {
  children: React.ReactNode;
}
