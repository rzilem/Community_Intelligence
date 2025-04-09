
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

export interface TrackingSystemItem {
  id: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}
