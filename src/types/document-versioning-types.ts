
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
