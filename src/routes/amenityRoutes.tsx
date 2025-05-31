
import React from 'react';
import { MapPin } from 'lucide-react';
import AmenitiesPage from '@/pages/amenities/AmenitiesPage';
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
];
