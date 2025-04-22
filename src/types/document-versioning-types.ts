
export type DocumentVersion = {
  id: string;
  document_id: string;
  version_number: number;
  url: string;
  file_size: number;
  notes?: string;
  created_at: string;
  created_by: string;
};

export type DocumentWithVersions = {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  category?: string;
  tags?: string[];
  current_version: number;
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_by?: string;
  uploaded_at: string;
  versions: DocumentVersion[];
};
