
import React from 'react';
import {
  IndexRouteObject,
  NonIndexRouteObject,
} from 'react-router-dom';

export type Route = (IndexRouteObject | NonIndexRouteObject) & {
  label?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category?: string;
  requiresAuth?: boolean;
  description?: string;
};

export interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface NavigationCategory {
  category: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavigationItem[];
}
