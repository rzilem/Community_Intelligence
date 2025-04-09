
// Document related types
export type Document = {
  id: string;
  association_id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_by?: string;
  uploaded_at: string;
};

// Document category type
export type DocumentCategory = {
  id: string;
  name: string;
  association_id: string;
  created_at?: string;
  updated_at?: string;
};

// For the tab interface
export type DocumentTab = 'documents' | 'templates';
