
import React from 'react';
import { 
  BarChart2, 
  FileText, 
  Calendar, 
  DollarSign, 
  Home, 
  AlertTriangle, 
  MessageSquare,
  Truck,
  Building,
  Users,
  Star
} from 'lucide-react';
import { WidgetDefinition } from '@/types/portal-types';

// Import widget components
import FinancialChartWidget from './widgets/FinancialChartWidget';
import DelinquentAccountsWidget from './widgets/DelinquentAccountsWidget';
import AmenityBookingsWidget from './widgets/AmenityBookingsWidget';
import UpcomingBidsWidget from './widgets/UpcomingBidsWidget';

export const widgetRegistry: Record<string, WidgetDefinition> = {
  'payments': {
    type: 'payments',
    name: 'Payments',
    description: 'View and manage your payments',
    icon: 'dollar-sign',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Current Balance: $0.00</p>
        <p className="text-sm text-muted-foreground">Last payment: None</p>
        <button className="bg-primary text-white py-2 px-4 rounded">Make a Payment</button>
      </div>
    )
  },
  'requests': {
    type: 'requests',
    name: 'Requests',
    description: 'View and submit homeowner requests',
    icon: 'file-text',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">0 Active Requests</p>
        <p className="text-sm text-muted-foreground">Submit a new request for your property</p>
        <button className="bg-primary text-white py-2 px-4 rounded">New Request</button>
      </div>
    )
  },
  'financial-chart': {
    type: 'financial-chart',
    name: 'Financial Chart',
    description: 'View financial trends for your association',
    icon: 'bar-chart-2',
    defaultEnabled: true,
    availableFor: ['board'],
    component: FinancialChartWidget
  },
  'delinquent-accounts': {
    type: 'delinquent-accounts',
    name: 'Delinquent Accounts',
    description: 'Track overdue accounts and payments',
    icon: 'alert-triangle',
    defaultEnabled: true,
    availableFor: ['board'],
    component: DelinquentAccountsWidget
  },
  'amenity-bookings': {
    type: 'amenity-bookings',
    name: 'Amenity Bookings',
    description: 'Book and manage community amenities',
    icon: 'calendar',
    defaultEnabled: true,
    availableFor: ['homeowner'],
    component: AmenityBookingsWidget
  },
  'upcoming-bids': {
    type: 'upcoming-bids',
    name: 'Upcoming Bids',
    description: 'View upcoming bid opportunities',
    icon: 'file-text',
    defaultEnabled: true,
    availableFor: ['vendor'],
    component: UpcomingBidsWidget
  },
  'documents': {
    type: 'documents',
    name: 'Documents',
    description: 'Access important documents',
    icon: 'file-text',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board', 'vendor'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Association Documents</p>
        <ul className="list-disc list-inside">
          <li>Community Guidelines</li>
          <li>HOA Bylaws</li>
          <li>Architectural Guidelines</li>
        </ul>
      </div>
    )
  },
  'violations': {
    type: 'violations',
    name: 'Violations',
    description: 'Track property violations',
    icon: 'alert-triangle',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">0 Active Violations</p>
        <p className="text-sm text-muted-foreground">You have no current violations</p>
      </div>
    )
  },
  'announcements': {
    type: 'announcements',
    name: 'Announcements',
    description: 'View community announcements',
    icon: 'message-square',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Recent Announcements</p>
        <p className="text-sm text-muted-foreground">No recent announcements</p>
      </div>
    )
  },
  'calendar': {
    type: 'calendar',
    name: 'Calendar',
    description: 'View upcoming events',
    icon: 'calendar',
    defaultEnabled: true,
    availableFor: ['homeowner', 'board', 'vendor'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Community Calendar</p>
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      </div>
    )
  },
  'vendor-stats': {
    type: 'vendor-stats',
    name: 'Vendor Statistics',
    description: 'View your vendor performance',
    icon: 'bar-chart-2',
    defaultEnabled: true,
    availableFor: ['vendor'],
    component: (props) => (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
            Preferred Vendor
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Company description here</p>
        <button className="w-full bg-primary text-white py-2 px-4 rounded">Update Profile</button>
      </div>
    )
  },
  'invoices': {
    type: 'invoices',
    name: 'Invoices',
    description: 'Manage your invoices',
    icon: 'file-text',
    defaultEnabled: true,
    availableFor: ['vendor'],
    component: (props) => (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Your Invoices</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Invoices:</span>
            <span>5</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Approval:</span>
            <span>2</span>
          </div>
        </div>
        <button className="w-full bg-primary text-white py-2 px-4 rounded">View All Invoices</button>
      </div>
    )
  },
  'preferred-status': {
    type: 'preferred-status',
    name: 'Preferred Status',
    description: 'View your preferred vendor status',
    icon: 'star',
    defaultEnabled: true,
    availableFor: ['vendor'],
    component: (props) => (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <p className="text-lg font-semibold">Preferred Vendor</p>
        </div>
        <p className="text-sm">Your company is listed as a preferred vendor which gives you priority access to bid opportunities.</p>
        <button className="w-full bg-primary text-white py-2 px-4 rounded">Manage Preferred Status</button>
      </div>
    )
  }
};

export const getAvailableWidgets = (portalType: 'homeowner' | 'board' | 'vendor'): WidgetDefinition[] => {
  return Object.values(widgetRegistry).filter(widget => 
    widget.availableFor.includes(portalType)
  );
};

export const getWidgetComponent = (widgetType: string): React.ComponentType<any> => {
  return widgetRegistry[widgetType]?.component || (() => <div>Widget not found</div>);
};

export const getWidgetIcon = (widgetType: string): string => {
  return widgetRegistry[widgetType]?.icon || 'square';
};
