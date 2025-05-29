
// Community Intelligence Bid Request Service
// File: src/services/bidRequestService.ts

import { supabase } from '@/lib/supabase';
import { 
  BidRequest, 
  BidRequestFormData, 
  Vendor, 
  VendorBid, 
  VendorResponseData,
  BidEvaluation,
  ProjectType,
  VendorPerformance,
  BidRequestSummary,
  BidRequestWithVendors
} from '@/types/bid-request-types';

/**
 * Bid Request Service
 * Handles all API interactions for the bid request system
 */
export class BidRequestService {
  
  // ===================================================================
  // BID REQUESTS
  // ===================================================================
  
  /**
   * Create a new bid request
   */
  async createBidRequest(data: BidRequestFormData): Promise<BidRequest> {
    try {
      // Map form data to database schema
      const bidRequestData = {
        hoa_id: data.hoa_id || data.association_id,
        association_id: data.association_id || data.hoa_id,
        maintenance_request_id: null,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        budget_range_min: data.budget_range_min,
        budget_range_max: data.budget_range_max,
        preferred_start_date: data.preferred_start_date,
        required_completion_date: data.required_completion_date,
        location: data.location,
        special_requirements: data.special_requirements,
        attachments: data.attachments ? JSON.stringify([]) : null,
        status: data.status,
        bid_deadline: data.bid_deadline,
        created_by: data.created_by || data.createdBy,
        visibility: data.allow_public_bidding ? 'public' : 'private'
      };

      const { data: bidRequest, error } = await supabase
        .from('bid_requests')
        .insert(bidRequestData)
        .select()
        .single();

      if (error) throw error;

      // Add selected vendors if any
      if (data.selected_vendor_ids.length > 0) {
        await this.addVendorsToBidRequest(bidRequest.id, data.selected_vendor_ids);
      }

      return this.mapDatabaseToBidRequest(bidRequest);
    } catch (error) {
      console.error('Error creating bid request:', error);
      throw new Error('Failed to create bid request');
    }
  }

  /**
   * Get bid request by ID
   */
  async getBidRequest(id: string): Promise<BidRequestWithVendors> {
    try {
      const { data, error } = await supabase
        .from('bid_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Get associated vendors
      const vendors = await this.getBidRequestVendors(id);
      
      const bidRequest = this.mapDatabaseToBidRequest(data);
      return {
        ...bidRequest,
        vendors
      };
    } catch (error) {
      console.error('Error fetching bid request:', error);
      throw new Error('Failed to fetch bid request');
    }
  }

  /**
   * Get bid requests for an association
   */
  async getBidRequests(associationId: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<BidRequestSummary[]> {
    try {
      let query = supabase
        .from('bid_requests')
        .select('*')
        .eq('association_id', associationId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(item => this.mapDatabaseToBidRequestSummary(item));
    } catch (error) {
      console.error('Error fetching bid requests:', error);
      throw new Error('Failed to fetch bid requests');
    }
  }

  /**
   * Update bid request
   */
  async updateBidRequest(id: string, updates: Partial<BidRequest>): Promise<BidRequest> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('bid_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseToBidRequest(data);
    } catch (error) {
      console.error('Error updating bid request:', error);
      throw new Error('Failed to update bid request');
    }
  }

  // ===================================================================
  // VENDORS
  // ===================================================================

  /**
   * Get vendors for an association
   */
  async getVendors(associationId: string): Promise<Vendor[]> {
    try {
      // Mock data for now since vendors table might not exist yet
      return [
        {
          id: '1',
          hoa_id: associationId,
          association_id: associationId,
          name: 'ABC Landscaping',
          contact_person: 'John Smith',
          email: 'john@abclandscaping.com',
          phone: '555-0101',
          address: '123 Garden St, Austin, TX',
          license_number: 'LND-2024-001',
          specialties: ['landscaping', 'irrigation'],
          rating: 4.5,
          total_jobs: 45,
          completed_jobs: 42,
          is_active: true,
          created_at: '2024-01-01T00:00:00',
          updated_at: '2024-01-15T10:30:00'
        }
      ];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }
  }

  /**
   * Add vendors to bid request
   */
  async addVendorsToBidRequest(bidRequestId: string, vendorIds: string[]): Promise<void> {
    try {
      const vendorData = vendorIds.map(vendorId => ({
        bid_request_id: bidRequestId,
        vendor_id: vendorId,
        status: 'invited'
      }));

      const { error } = await supabase
        .from('bid_request_vendors')
        .insert(vendorData);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding vendors to bid request:', error);
      throw new Error('Failed to add vendors to bid request');
    }
  }

  /**
   * Get bid request vendors
   */
  async getBidRequestVendors(bidRequestId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bid_request_vendors')
        .select('*')
        .eq('bid_request_id', bidRequestId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bid request vendors:', error);
      return [];
    }
  }

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  /**
   * Map database record to BidRequest interface
   */
  private mapDatabaseToBidRequest(data: any): BidRequest {
    return {
      id: data.id,
      hoa_id: data.hoa_id || data.association_id,
      association_id: data.association_id || data.hoa_id,
      maintenance_request_id: data.maintenance_request_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      budget_range_min: data.budget_range_min,
      budget_range_max: data.budget_range_max,
      preferred_start_date: data.preferred_start_date,
      required_completion_date: data.required_completion_date,
      location: data.location,
      special_requirements: data.special_requirements,
      attachments: data.attachments ? JSON.parse(data.attachments) : [],
      status: data.status,
      bid_deadline: data.bid_deadline,
      selected_vendor_id: data.selected_vendor_id,
      awarded_amount: data.awarded_amount,
      awarded_at: data.awarded_at,
      created_by: data.created_by,
      createdBy: data.created_by, // Dual support
      created_at: data.created_at,
      updated_at: data.updated_at,
      imageUrl: data.image_url,
      visibility: data.visibility,
      due_date: data.due_date,
      budget: data.budget
    };
  }

  /**
   * Map database record to BidRequestSummary interface
   */
  private mapDatabaseToBidRequestSummary(data: any): BidRequestSummary {
    return {
      id: data.id,
      title: data.title,
      hoa_id: data.hoa_id || data.association_id,
      status: data.status,
      priority: data.priority,
      budget_range_min: data.budget_range_min,
      budget_range_max: data.budget_range_max,
      bid_deadline: data.bid_deadline,
      total_bids: 0, // Will be calculated
      selected_vendor_id: data.selected_vendor_id,
      awarded_amount: data.awarded_amount,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

// Export singleton instance
export const bidRequestService = new BidRequestService();

// Export individual methods for tree shaking
export const {
  createBidRequest,
  getBidRequest,
  getBidRequests,
  updateBidRequest,
  getVendors,
  addVendorsToBidRequest,
  getBidRequestVendors
} = bidRequestService;
