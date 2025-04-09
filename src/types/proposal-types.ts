
export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
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
  sent_date?: string;
  viewed_date?: string;
  responded_date?: string;
  created_at: string;
  updated_at: string;
}
