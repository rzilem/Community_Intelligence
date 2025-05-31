
export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  url: string;
  file_size: number;
  created_by?: string;
  notes?: string;
  created_at: string;
}

export interface DocumentWithVersions {
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
  last_accessed?: string | null;
  current_version?: number;
  versions?: DocumentVersion[];
}
