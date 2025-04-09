
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
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  order: number;
  attachments?: ProposalAttachment[];
}
