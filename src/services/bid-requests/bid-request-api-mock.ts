import { BidRequest, BidRequestWithVendors } from '@/types/bid-request-types';

// Mock implementation for bid request API
export async function createBidRequest(bidRequestData: Partial<BidRequest>): Promise<BidRequest> {
  console.log('=== MOCK: Creating bid request ===');
  console.log('Data:', bidRequestData);

  const mockBidRequest: BidRequest = {
    id: Math.random().toString(),
    association_id: bidRequestData.association_id || '1',
    title: bidRequestData.title || 'Mock Bid Request',
    description: bidRequestData.description || '',
    category: bidRequestData.category || 'general',
    priority: bidRequestData.priority || 'medium',
    status: 'draft',
    visibility: 'association',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...bidRequestData
  };

  return mockBidRequest;
}

export async function getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
  console.log('=== MOCK: Fetching bid requests ===', associationId);
  
  const mockBidRequests: BidRequestWithVendors[] = [
    {
      id: '1',
      association_id: associationId,
      title: 'Pool Maintenance',
      description: 'Regular pool cleaning and chemical balancing',
      category: 'maintenance',
      priority: 'medium',
      status: 'published',
      visibility: 'association',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vendors: [],
      associations: {
        id: associationId,
        name: 'Sample HOA'
      }
    }
  ];

  return mockBidRequests;
}

export async function getAllBidRequests(): Promise<BidRequestWithVendors[]> {
  console.log('=== MOCK: Fetching all bid requests ===');
  return getBidRequests('all');
}

export async function updateBidRequest(id: string, updates: Partial<BidRequest>): Promise<BidRequest> {
  console.log('=== MOCK: Updating bid request ===', id, updates);
  
  const mockUpdatedBidRequest: BidRequest = {
    id,
    association_id: '1',
    title: 'Updated Bid Request',
    priority: 'medium',
    status: 'draft',
    visibility: 'association',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...updates
  };

  return mockUpdatedBidRequest;
}

export async function deleteBidRequest(id: string): Promise<void> {
  console.log('=== MOCK: Deleting bid request ===', id);
  // Mock deletion - no actual operation needed
}