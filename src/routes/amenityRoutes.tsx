
import React from 'react';
import { MapPin } from 'lucide-react';
import AmenitiesPage from '@/pages/amenities/AmenitiesPage';
import AmenityListPage from '@/pages/amenities/AmenityListPage';
import AmenityDetailPage from '@/pages/amenities/AmenityDetailPage';
import { Route } from './types';

export const amenityRoutes: Route[] = [
  {
    path: 'amenities',
    element: <AmenitiesPage />,
    label: 'Amenities',
    icon: MapPin,
    category: 'amenities',
    requiresAuth: true,
    description: 'Manage amenity bookings and availability'
  },
  {
    path: 'amenities/browse',
    element: <AmenityListPage />,
    label: 'Browse Amenities',
    category: 'amenities',
    requiresAuth: true,
    description: 'Browse all available amenities'
  },
  {
    path: 'amenities/:amenityType',
    element: <AmenityDetailPage />,
    category: 'amenities',
    requiresAuth: true,
    description: 'View amenity details and book'
  },
];
