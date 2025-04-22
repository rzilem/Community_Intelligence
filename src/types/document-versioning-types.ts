
import { Document } from './document-types';

export type DocumentVersion = {
  id: string;
  document_id: string;
  version_number: number;
  url: string;
  file_size: number;
  created_at: string;
  created_by: string;
  notes?: string;
};

export type DocumentWithVersions = Document & {
  versions: DocumentVersion[];
  current_version: number;
};

export interface VersionHistoryState {
  isOpen: boolean;
  document?: DocumentWithVersions;
}
