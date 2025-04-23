export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export type MessageCategory =
  | 'general'
  | 'maintenance'
  | 'compliance'
  | 'events'
  | 'financial'
  | 'emergency'
  | 'announcement'
  | 'community';

export interface Announcement {
  id: string;
  association_id: string;
  title: string;
  content: string;
  author_id: string;
  is_published: boolean;
  publish_date: string;
  expiry_date: string;
  priority: AnnouncementPriority;
  category: MessageCategory;
  created_at: string;
  updated_at: string;
}

export interface RecipientGroup {
  id: string;
  name: string;
  association_id: string;
  group_type: 'system' | 'custom';
  criteria: any;
  created_at: string;
  updated_at: string;
}

export interface MessageRecipient {
  id: string;
  name: string;
  email: string;
  type: string;
}

export interface AssociationMemberRole {
  id: string;
  association_id: string;
  user_id: string;
  role_name: string;
  role_type: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationType {
  id: string;
  name: string;
  description?: string;
}

export interface CommunicationLogEntry {
  id: string;
  communication_type: string;
  received_at: string;
  processed_at?: string;
  status: 'received' | 'processing' | 'completed' | 'failed';
  tracking_number: string;
  homeowner_request_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}
