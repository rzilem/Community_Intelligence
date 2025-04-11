export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

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
