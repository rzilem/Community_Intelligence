
// Community Intelligence Bid Request Form Types
// File: src/types/bid-request-form-types.ts

import { BidRequestFormData as BaseBidRequestFormData, AttachmentFile } from './bid-request-types';

// Form-specific interface that handles File uploads instead of AttachmentFile[]
export interface BidRequestFormData extends Omit<BaseBidRequestFormData, 'attachments'> {
  // Override attachments to use File[] for form uploads (before they're saved)
  attachments: File[];
}

// Type for when we need to work with saved attachments (AttachmentFile[])
export interface BidRequestFormDataWithSavedAttachments extends Omit<BidRequestFormData, 'attachments'> {
  attachments: AttachmentFile[];
}

// Utility type for form props that need to handle both scenarios
export type BidRequestFormProps = BidRequestFormData | BidRequestFormDataWithSavedAttachments;
