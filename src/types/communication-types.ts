
// Communication related types
export type Announcement = {
  id: string;
  association_id: string;
  title: string;
  content: string;
  author_id?: string;
  is_published?: boolean;
  publish_date?: string;
  expiry_date?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at?: string;
  updated_at?: string;
};

export type Comment = {
  id: string;
  parent_type: string;
  parent_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

// Tracking system related types
export interface TrackingSystemItem {
  id: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

export interface TrackableItem {
  id: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export type CommunicationType = 'invoice' | 'lead' | 'email' | 'message' | 'workflow';

export interface CommunicationLogEntry {
  id: string;
  tracking_number: string;
  communication_type: CommunicationType;
  metadata: Record<string, any>;
  received_at: string;
  processed_at?: string;
  status: 'received' | 'processing' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface RecipientGroup {
  id: string;
  association_id: string;
  name: string;
  description: string | null;
  group_type: 'system' | 'custom';
  criteria: any | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRecipient {
  id: string;
  name: string;
  group_id: string;
  association_id: string;
  association_name?: string;
}

export interface AssociationMemberRole {
  id: string;
  user_id: string;
  association_id: string;
  role_type: 'board' | 'committee';
  role_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}
