import { Resident } from './resident-types';

export const mockResidents = [
  {
    id: 'RES-201',
    name: 'Michael Thompson',
    email: 'michael.thompson@example.com',
    phone: '(512) 555-1234',
    type: 'owner',
    propertyId: 'PROP-101',
    propertyAddress: '123 Oak Lane',
    association: 'Oakridge Estates',
    moveInDate: '2020-06-15',
    status: 'active'
  },
  {
    id: 'RES-202',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(512) 555-2345',
    type: 'owner',
    propertyId: 'PROP-102',
    propertyAddress: '456 Maple Street',
    association: 'Oakridge Estates',
    moveInDate: '2021-03-22',
    status: 'active'
  },
  {
    id: 'RES-203',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '(512) 555-3456',
    type: 'owner',
    propertyId: 'PROP-104',
    propertyAddress: '101 Elm Court',
    association: 'Lakeside Community',
    moveInDate: '2019-09-10',
    status: 'active'
  },
  {
    id: 'RES-204',
    name: 'Jennifer Miller',
    email: 'jennifer.miller@example.com',
    phone: '(512) 555-4567',
    type: 'owner',
    propertyId: 'PROP-105',
    propertyAddress: '202 Cedar Road',
    association: 'Lakeside Community',
    moveInDate: '2022-01-05',
    status: 'active'
  },
  {
    id: 'RES-205',
    name: 'Robert Davis',
    email: 'robert.davis@example.com',
    phone: '(512) 555-5678',
    type: 'tenant',
    propertyId: 'PROP-103',
    propertyAddress: '789 Pine Avenue',
    association: 'Highland Towers',
    moveInDate: '2023-05-17',
    status: 'inactive'
  },
  {
    id: 'RES-206',
    name: 'Lisa Garcia',
    email: 'lisa.garcia@example.com',
    phone: '(512) 555-6789',
    type: 'tenant',
    propertyId: 'PROP-106',
    propertyAddress: '303 Birch Drive',
    association: 'Highland Towers',
    moveInDate: '2023-11-30',
    status: 'pending-approval'
  },
];
