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
  created_at: string;  // Match database column name
  updated_at: string;  // Match database column name
  resident_id?: string; // Optional to handle null values
  property_id?: string; // Optional to handle null values
  association_id?: string; // Optional to handle null values
  assigned_to?: string;
  resolved_at?: string;
  html_content?: string; // For original email content
  tracking_number?: string; 
  attachments?: RequestAttachment[]; // Added attachments property
  
  // Virtual properties for UI (not in database)
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
  residentId?: string; // Alias for resident_id
  propertyId?: string; // Alias for property_id
  associationId?: string; // Alias for association_id
  resolvedAt?: string; // Alias for resolved_at
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
