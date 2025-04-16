
export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  folder_id?: string;
  attachments?: ProposalAttachment[];
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  lead_id: string;
  template_id?: string;
  name: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  content: string;
  amount: number;
  attachments?: ProposalAttachment[];
  sent_date?: string;
  viewed_date?: string;
  responded_date?: string;
  created_at: string;
  updated_at: string;
  sections?: ProposalSection[];
}

export interface ProposalFolder {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'document' | 'other';
  url: string;
  size?: number;
  content_type: string;
  created_at: string;
  [key: string]: any; // Add index signature to make compatible with JSON
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  order: number;
  attachments?: ProposalAttachment[];
}

export interface ProposalAnalytics {
  views: number;
  avg_view_time?: number;
  most_viewed_section?: string;
  initial_view_date?: string;
  last_view_date?: string;
  view_count_by_section?: Record<string, number>;
}
