
export type WidgetType = 
  | 'payments'
  | 'requests'
  | 'violations'
  | 'announcements'
  | 'amenities'
  | 'documents'
  | 'calendar'
  | 'weather'
  | 'quick-actions'
  | 'board-summary'
  | 'financial-snapshot'
  | 'vendor-stats'
  | 'invoices'
  | 'bid-opportunities'
  | 'preferred-status';

export interface PortalWidget {
  id: string;
  widgetType: WidgetType;
  settings: Record<string, any>;
  position: number;
  isEnabled: boolean;
}

export interface UserPortalWidget extends PortalWidget {
  userId: string;
}

export interface AssociationPortalWidget extends PortalWidget {
  associationId: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  companyName: string;
  companyDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  isPreferred: boolean;
  servicesOffered: string[];
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
