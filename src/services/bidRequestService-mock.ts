import { BidRequestFormData, BidRequest } from '@/types/bid-request-types';

// Mock implementation for bid request service
export const bidRequestService = {
  async createBidRequest(data: BidRequestFormData): Promise<BidRequest> {
    console.log('=== MOCK: Creating bid request ===', data);
    
    const mockBidRequest: BidRequest = {
      id: Math.random().toString(),
      association_id: data.association_id || '1',
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      visibility: 'association',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      budget_range_min: data.budget_range_min,
      budget_range_max: data.budget_range_max,
      preferred_start_date: data.preferred_start_date,
      required_completion_date: data.required_completion_date,
      location: data.location,
      special_requirements: data.special_requirements,
      bid_deadline: data.bid_deadline,
      created_by: data.created_by || data.createdBy
    };

    return mockBidRequest;
  },

  async getBidRequests(associationId?: string): Promise<BidRequest[]> {
    console.log('=== MOCK: Getting bid requests ===', associationId);
    
    return [
      {
        id: '1',
        association_id: associationId || '1',
        title: 'Pool Maintenance',
        description: 'Regular maintenance needed',
        priority: 'medium',
        status: 'published',
        visibility: 'association',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  },

  async updateBidRequest(id: string, updates: Partial<BidRequest>): Promise<BidRequest> {
    console.log('=== MOCK: Updating bid request ===', id, updates);
    
    return {
      id,
      association_id: '1',
      title: 'Updated Request',
      priority: 'medium',
      status: 'draft',
      visibility: 'association',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    };
  }
};