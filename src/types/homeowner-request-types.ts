export type HomeownerRequestStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
export type HomeownerRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HomeownerRequestType = 'maintenance' | 'compliance' | 'billing' | 'general' | 'amenity';

export interface RequestAttachment {
  name: string;
  url: string;
  size: number;
  type?: string;
}

export interface HomeownerRequest {
  id: string;
  title: string;
  description: string;
  status: HomeownerRequestStatus;
  priority: HomeownerRequestPriority;
  type: HomeownerRequestType;
  created_at: string;
  updated_at: string;
  resident_id?: string;
  property_id?: string;
  association_id?: string;
  assigned_to?: string;
  resolved_at?: string;
  html_content?: string;
  tracking_number?: string; 
  attachments?: RequestAttachment[]; 
  
  createdAt?: string;
  updatedAt?: string;
  residentId?: string;
  propertyId?: string;
  associationId?: string;
  resolvedAt?: string;
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
  { id: 'tracking_number', label: 'Tracking Number', accessorKey: 'tracking_number', defaultVisible: true },
  { id: 'created_at', label: 'Created', accessorKey: 'created_at', defaultVisible: true },
  { id: 'email', label: 'Email', accessorKey: 'email', defaultVisible: false },
  { id: 'updated_at', label: 'Updated', accessorKey: 'updated_at', defaultVisible: false },
  { id: 'description', label: 'Description', accessorKey: 'description', defaultVisible: false },
  { id: 'resident_id', label: 'Owner', accessorKey: 'resident_id', defaultVisible: false },
  { id: 'property_id', label: 'Property', accessorKey: 'property_id', defaultVisible: true },
  { id: 'association_id', label: 'Association', accessorKey: 'association_id', defaultVisible: true },
  { id: 'assigned_to', label: 'Assigned To', accessorKey: 'assigned_to', defaultVisible: false },
  { id: 'resolved_at', label: 'Resolved At', accessorKey: 'resolved_at', defaultVisible: false },
];
