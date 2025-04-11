
import { Document } from './document-types';

// Define resale package types
export type ResalePackageStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'delivered';

export interface ResalePackage {
  id: string;
  association_id: string;
  property_id: string;
  requested_by: string;
  requested_date: string;
  due_date: string;
  completed_date?: string;
  status: ResalePackageStatus;
  notes?: string;
  total_fee: number;
  is_rush: boolean;
  created_at: string;
  updated_at: string;
}

// Document-linking interface
export interface ResaleDocumentLink {
  id: string;
  resale_package_id: string;
  document_id: string;
  document_type: 'certificate' | 'questionnaire' | 'inspection' | 'statement' | 'trec_form' | 'other';
  is_required: boolean;
  is_included: boolean;
  created_at: string;
  updated_at: string;
  document?: Document; // The linked document with full details
}

// Resale document categories
export const RESALE_DOCUMENT_CATEGORIES = [
  'certificate', 
  'questionnaire', 
  'inspection', 
  'statement', 
  'trec_form', 
  'other'
] as const;

// Resale document filter params
export interface ResaleDocumentFilterParams {
  associationId?: string;
  packageId?: string;
  documentType?: string;
  includedOnly?: boolean;
}
