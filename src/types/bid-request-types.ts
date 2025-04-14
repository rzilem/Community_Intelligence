
import { Vendor } from './vendor-types';
import { Association } from './association-types';

export interface BidRequest {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'open' | 'closed' | 'awarded';
  associationId: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  budget?: number;
  category?: string;
  visibility: 'private' | 'association' | 'public';
  imageUrl?: string;
  attachments?: string[];
}

export interface BidRequestVendor {
  id: string;
  bidRequestId: string;
  vendorId: string;
  status: 'invited' | 'accepted' | 'declined' | 'submitted';
  quoteAmount?: number;
  quoteDetails?: Record<string, any>;
  submittedAt?: string;
}

export interface BidRequestWithVendors extends BidRequest {
  vendors?: (BidRequestVendor & { vendorDetails?: Vendor })[];
  associationDetails?: Association;
}
