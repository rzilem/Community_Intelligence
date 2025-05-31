
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  settings: WidgetSettings;
  permissions: RolePermissions;
  gridPosition: GridPosition;
  isActive: boolean;
}

export type WidgetType = 
  | 'calendar'
  | 'announcements'
  | 'payments'
  | 'maintenance'
  | 'documents'
  | 'weather'
  | 'contacts'
  | 'amenities'
  | 'custom';

export interface WidgetSettings {
  title?: string;
  description?: string;
  refreshInterval?: number;
  displayMode?: 'compact' | 'detailed' | 'minimal';
  customCss?: string;
  dataSource?: string;
  filters?: Record<string, any>;
}

export interface RolePermissions {
  viewRoles: string[];
  editRoles: string[];
  deleteRoles: string[];
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  customCss?: string;
}

export interface PortalSettings {
  id: string;
  hoaId: string;
  name: string;
  widgets: Widget[];
  branding: BrandingSettings;
  layout: LayoutTemplate;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type LayoutTemplate = 
  | 'modern-dashboard'
  | 'classic-list'
  | 'minimal-clean'
  | 'information-dense'
  | 'mobile-first';

export interface ABTest {
  id: string;
  name: string;
  variants: PortalVariant[];
  metrics: string[];
  startDate: Date;
  endDate?: Date;
  allocation: number;
  isActive: boolean;
}

export interface PortalVariant {
  id: string;
  name: string;
  portalSettings: PortalSettings;
  allocation: number;
}
