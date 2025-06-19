
// Document related types
export type Document = {
  id: string;
  association_id: string;
  property_id?: string | null;
  owner_id?: string | null;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  category?: string;
  document_type?: string;
  folder_path?: string;
  tags?: string[];
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_by?: string;
  uploaded_at: string;
  last_accessed?: string | null;
  current_version?: number;
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

// Hook params type for categories
export type UseCategoriesParams = {
  associationId?: string;
  enabled?: boolean;
};

// Hook params type for documents
export type UseDocumentsParams = {
  associationId?: string;
  propertyId?: string;
  ownerId?: string;
  category?: string | null;
  enabled?: boolean;
};
