
// Community Intelligence Bid Request Form Types
// File: src/types/bid-request-form-types.ts

import { BidRequestWithVendors, AttachmentFile } from './bid-request-types';

// Form-specific interface that extends BidRequestWithVendors but handles File uploads
export interface BidRequestFormData extends Omit<BidRequestWithVendors, 'attachments' | 'id' | 'created_at' | 'updated_at'> {
  // Override attachments to use File[] for form uploads (before they're saved)
  attachments: File[];
  
  // Form-specific optional fields
  hoa_id: string;
  project_type_id: string;
  number_of_bids_wanted: number;
  project_details: Record<string, any>;
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  bid_deadline: string;
  created_by: string;
  status: 'draft' | 'published';
  
  // Optional fields that may not be set during form creation
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Type for when we need to work with saved attachments (AttachmentFile[])
export interface BidRequestFormDataWithSavedAttachments extends Omit<BidRequestFormData, 'attachments'> {
  attachments: AttachmentFile[];
}

// Utility type for form props that need to handle both scenarios
export type BidRequestFormProps = BidRequestFormData | BidRequestFormDataWithSavedAttachments;
