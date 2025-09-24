import { BidRequestVendor } from '@/types/bid-request-types';
import { getVendorSpecialtiesForBidRequestCategory } from '@/constants/category-mappings';

// Mock implementation for bid request vendor API

export async function getBidRequestVendors(bidRequestId: string): Promise<BidRequestVendor[]> {
  console.log('=== MOCK: Fetching bid request vendors ===', bidRequestId);
  
  const mockVendors: BidRequestVendor[] = [
    {
      id: '1',
      bid_request_id: bidRequestId,
      vendor_id: '1',
      status: 'invited',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  return mockVendors;
}

export async function addVendorToBidRequest(bidRequestVendor: Partial<BidRequestVendor>): Promise<BidRequestVendor> {
  console.log('=== MOCK: Adding vendor to bid request ===', bidRequestVendor);
  
  const mockVendor: BidRequestVendor = {
    id: Math.random().toString(),
    bid_request_id: bidRequestVendor.bid_request_id || '',
    vendor_id: bidRequestVendor.vendor_id || '',
    status: bidRequestVendor.status || 'invited',
    quote_amount: bidRequestVendor.quote_amount,
    quote_details: bidRequestVendor.quote_details,
    submitted_at: bidRequestVendor.submitted_at,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return mockVendor;
}

export async function filterEligibleVendors(associationId: string, bidRequestCategory?: string): Promise<any[]> {
  console.log('=== MOCK: Filtering eligible vendors ===', associationId, bidRequestCategory);
  
  let vendorSpecialties: string[] = [];
  if (bidRequestCategory) {
    vendorSpecialties = getVendorSpecialtiesForBidRequestCategory(bidRequestCategory);
  }

  const mockVendors = [
    { 
      id: '1', 
      name: 'ABC Maintenance', 
      include_in_bids: true,
      specialties: ['General Maintenance', 'Repairs & Maintenance']
    },
    { 
      id: '2', 
      name: 'XYZ Contractors', 
      include_in_bids: true,
      specialties: ['Construction', 'Concrete']
    },
    { 
      id: '3', 
      name: 'City Landscaping', 
      include_in_bids: true,
      specialties: ['Landscape', 'Landscaping Maintenance']
    }
  ];

  // Filter by category if specified
  if (vendorSpecialties.length > 0) {
    return mockVendors.filter(vendor => 
      vendor.specialties.some(specialty => vendorSpecialties.includes(specialty))
    );
  }

  return mockVendors;
}