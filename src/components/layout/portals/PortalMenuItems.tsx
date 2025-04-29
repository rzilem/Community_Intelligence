
import React from 'react';
import { Home, Building, Truck, ScrollText } from 'lucide-react';
import { NavItemProps } from '../types';

export const getPortalMenuItems = (currentPath: string): NavItemProps[] => {
  return [
    {
      name: 'Homeowner Portal',
      path: '/portal/homeowner',
      icon: Home,
      isActive: currentPath.startsWith('/portal/homeowner')
    },
    {
      name: 'Board Portal',
      path: '/portal/board',
      icon: Building,
      isActive: currentPath.startsWith('/portal/board')
    },
    {
      name: 'Vendor Portal',
      path: '/portal/vendor',
      icon: Truck,
      isActive: currentPath.startsWith('/portal/vendor')
    },
    {
      name: 'Resale Portal',
      path: '/resale-portal',
      icon: ScrollText,
      isActive: currentPath.startsWith('/resale-portal')
    }
  ];
};
