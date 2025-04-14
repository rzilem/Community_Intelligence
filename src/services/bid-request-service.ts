
// This file is kept for backward compatibility
// It re-exports all the functionality from the new, more focused modules

import { 
  createBidRequest, 
  getBidRequests, 
  getBidRequestById,
  updateBidRequest 
} from './bid-requests/bid-request-api';

import { 
  addVendorToBidRequest, 
  filterEligibleVendors,
  getBidRequestVendors 
} from './bid-requests/bid-request-vendor-api';

import { 
  uploadBidRequestImage 
} from './bid-requests/bid-request-media-api';

// Re-export all the functionality with the same interface
export const bidRequestService = {
  createBidRequest,
  getBidRequests,
  getBidRequestById,
  updateBidRequest,
  addVendorToBidRequest,
  uploadBidRequestImage,
  filterEligibleVendors
};
