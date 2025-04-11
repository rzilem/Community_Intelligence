
export type HomeownerRequestStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type HomeownerRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HomeownerRequestType = 'maintenance' | 'compliance' | 'billing' | 'general' | 'amenity';

export interface HomeownerRequest {
  id: string;
  title: string;
  description: string;
  status: HomeownerRequestStatus;
  priority: HomeownerRequestPriority;
  type: HomeownerRequestType;
  createdAt: string;
  updatedAt: string;
  residentId: string;
  propertyId: string;
  associationId: string;
  assignedTo?: string;
  resolvedAt?: string;
  html_content?: string; // For original email content
  tracking_number?: string; // Added tracking number field
}

export interface HomeownerRequestColumn {
  id: string;
  label: string;
  accessorKey: string;
  defaultVisible: boolean;
}

export interface HomeownerRequestComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string;
  parent_type: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export const HOMEOWNER_REQUEST_COLUMNS: HomeownerRequestColumn[] = [
  { id: 'title', label: 'Title', accessorKey: 'title', defaultVisible: true },
  { id: 'type', label: 'Type', accessorKey: 'type', defaultVisible: true },
  { id: 'status', label: 'Status', accessorKey: 'status', defaultVisible: true },
  { id: 'priority', label: 'Priority', accessorKey: 'priority', defaultVisible: true },
  { id: 'createdAt', label: 'Created', accessorKey: 'createdAt', defaultVisible: true },
  { id: 'updatedAt', label: 'Updated', accessorKey: 'updatedAt', defaultVisible: false },
  { id: 'description', label: 'Description', accessorKey: 'description', defaultVisible: false },
  { id: 'residentId', label: 'Resident', accessorKey: 'residentId', defaultVisible: false },
  { id: 'propertyId', label: 'Property', accessorKey: 'propertyId', defaultVisible: false },
  { id: 'associationId', label: 'Association', accessorKey: 'associationId', defaultVisible: false },
  { id: 'assignedTo', label: 'Assigned To', accessorKey: 'assignedTo', defaultVisible: false },
  { id: 'resolvedAt', label: 'Resolved At', accessorKey: 'resolvedAt', defaultVisible: false },
  { id: 'tracking_number', label: 'Tracking Number', accessorKey: 'tracking_number', defaultVisible: false },
];
