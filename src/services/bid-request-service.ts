// Community Intelligence Bid Request Service
// File: frontend/src/services/bidRequestService.ts

import { createClient } from '@supabase/supabase-js';
import { 
  BidRequest, 
  BidRequestFormData, 
  Vendor, 
  VendorBid, 
  VendorResponseData,
  BidEvaluation,
  ProjectType,
  VendorPerformance,
  BidRequestSummary
} from '../types/bidRequest';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      // Upload attachments first if any
      const attachmentUrls: string[] = [];
      if (data.attachments && data.attachments.length > 0) {
        for (const file of data.attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bid-attachments')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('bid-attachments')
            .getPublicUrl(fileName);
          
          attachmentUrls.push(publicUrl);
        }
      }

      // Create bid request record
      const bidRequestData = {
        hoa_id: data.hoa_id,
        maintenance_request_id: data.maintenance_request_id || null,
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
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
        status: data.status,
        bid_deadline: data.bid_deadline,
        created_by: data.created_by
      };

      const { data: bidRequest, error } = await supabase
        .from('bid_requests')
        .insert(bidRequestData)
        .select()
        .single();

      if (error) throw error;

      // If vendors are selected, send notifications
      if (data.selected_vendor_ids.length > 0) {
        await this.notifySelectedVendors(bidRequest.id, data.selected_vendor_ids);
      }

      // If public bidding is allowed, send public notification
      if (data.allow_public_bidding) {
        await this.notifyPublicVendors(bidRequest.id, data.hoa_id);
      }

      return bidRequest;
    } catch (error) {
      console.error('Error creating bid request:', error);
      throw new Error('Failed to create bid request');
    }
  }

  /**
   * Get bid request by ID
   */
  async getBidRequest(id: string, token?: string): Promise<BidRequest> {
    try {
      let query = supabase
        .from('bid_requests')
        .select('*')
        .eq('id', id)
        .single();

      // If token is provided, validate it (for public vendor access)
      if (token) {
        // TODO: Implement token validation logic
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bid request:', error);
      throw new Error('Failed to fetch bid request');
    }
  }

  /**
   * Get bid requests for an HOA
   */
  async getBidRequests(hoaId: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<BidRequestSummary[]> {
    try {
      let query = supabase
        .from('bid_request_summary')
        .select('*')
        .eq('hoa_id', hoaId);

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
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bid requests:', error);
      throw new Error('Failed to fetch bid requests');
    }
  }

  /**
   * Update bid request status
   */
  async updateBidRequestStatus(id: string, status: string, updates?: Partial<BidRequest>): Promise<BidRequest> {
    try {
      const updateData = {
        status,
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
      return data;
    } catch (error) {
      console.error('Error updating bid request:', error);
      throw new Error('Failed to update bid request');
    }
  }

  // ===================================================================
  // VENDOR BIDS
  // ===================================================================

  /**
   * Submit vendor bid response
   */
  async submitVendorBid(bidRequestId: string, vendorId: string, data: VendorResponseData): Promise<VendorBid> {
    try {
      // Upload attachments if any
      const attachmentUrls: string[] = [];
      if (data.attachments && data.attachments.length > 0) {
        for (const file of data.attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('vendor-bid-attachments')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('vendor-bid-attachments')
            .getPublicUrl(fileName);
          
          attachmentUrls.push(publicUrl);
        }
      }

      const bidData = {
        bid_request_id: bidRequestId,
        vendor_id: vendorId,
        bid_amount: data.bid_amount,
        proposed_timeline: data.timeline_days,
        timeline_start_date: data.timeline_start_date,
        timeline_completion_date: data.timeline_completion_date,
        proposal_text: data.proposal_text,
        warranty_terms: data.warranty_terms,
        payment_terms: data.payment_terms,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
        status: data.interested ? 'submitted' : 'withdrawn'
      };

      const { data: bid, error } = await supabase
        .from('vendor_bids')
        .upsert(bidData, { onConflict: 'bid_request_id,vendor_id' })
        .select()
        .single();

      if (error) throw error;

      // Send notification to HOA
      await this.notifyHOAOfBidSubmission(bidRequestId, vendorId);

      return bid;
    } catch (error) {
      console.error('Error submitting vendor bid:', error);
      throw new Error('Failed to submit bid');
    }
  }

  /**
   * Get vendor bids for a bid request
   */
  async getVendorBids(bidRequestId: string): Promise<VendorBid[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_bids')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('bid_request_id', bidRequestId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor bids:', error);
      throw new Error('Failed to fetch vendor bids');
    }
  }

  /**
   * Select winning bid
   */
  async selectWinningBid(bidId: string, awardedAmount?: number): Promise<VendorBid> {
    try {
      // First, get the bid to get bid_request_id
      const { data: bid, error: bidError } = await supabase
        .from('vendor_bids')
        .select('bid_request_id, vendor_id')
        .eq('id', bidId)
        .single();

      if (bidError) throw bidError;

      // Mark all other bids as not selected
      await supabase
        .from('vendor_bids')
        .update({ is_selected: false })
        .eq('bid_request_id', bid.bid_request_id);

      // Mark this bid as selected
      const { data: selectedBid, error } = await supabase
        .from('vendor_bids')
        .update({ 
          is_selected: true,
          status: 'accepted'
        })
        .eq('id', bidId)
        .select()
        .single();

      if (error) throw error;

      // Update bid request with selected vendor
      await supabase
        .from('bid_requests')
        .update({
          selected_vendor_id: bid.vendor_id,
          awarded_amount: awardedAmount,
          awarded_at: new Date().toISOString(),
          status: 'awarded'
        })
        .eq('id', bid.bid_request_id);

      // Send notifications
      await this.notifyBidAwarded(bid.bid_request_id, bid.vendor_id);
      await this.notifyBidsRejected(bid.bid_request_id, bid.vendor_id);

      return selectedBid;
    } catch (error) {
      console.error('Error selecting winning bid:', error);
      throw new Error('Failed to select winning bid');
    }
  }

  // ===================================================================
  // VENDORS
  // ===================================================================

  /**
   * Get vendors for an HOA
   */
  async getVendors(hoaId: string, filters?: {
    specialties?: string[];
    is_active?: boolean;
    rating_min?: number;
  }): Promise<Vendor[]> {
    try {
      let query = supabase
        .from('vendors')
        .select('*')
        .eq('hoa_id', hoaId);

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.rating_min) {
        query = query.gte('rating', filters.rating_min);
      }
      if (filters?.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties);
      }

      query = query.order('name');

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }
  }

  /**
   * Get vendor performance data
   */
  async getVendorPerformance(hoaId: string): Promise<VendorPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_performance')
        .select('*')
        .eq('hoa_id', hoaId)
        .order('bid_win_rate', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
      throw new Error('Failed to fetch vendor performance');
    }
  }

  /**
   * Create or update vendor
   */
  async upsertVendor(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .upsert(vendor)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting vendor:', error);
      throw new Error('Failed to save vendor');
    }
  }

  // ===================================================================
  // PROJECT TYPES
  // ===================================================================

  /**
   * Get project types
   */
  async getProjectTypes(): Promise<ProjectType[]> {
    try {
      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project types:', error);
      throw new Error('Failed to fetch project types');
    }
  }

  // ===================================================================
  // NOTIFICATIONS (Private Methods)
  // ===================================================================

  private async notifySelectedVendors(bidRequestId: string, vendorIds: string[]): Promise<void> {
    // TODO: Implement email notification to selected vendors
    console.log(`Notifying selected vendors for bid request ${bidRequestId}:`, vendorIds);
  }

  private async notifyPublicVendors(bidRequestId: string, hoaId: string): Promise<void> {
    // TODO: Implement public notification system
    console.log(`Notifying public vendors for bid request ${bidRequestId} in HOA ${hoaId}`);
  }

  private async notifyHOAOfBidSubmission(bidRequestId: string, vendorId: string): Promise<void> {
    // TODO: Implement HOA notification
    console.log(`Notifying HOA of bid submission for request ${bidRequestId} from vendor ${vendorId}`);
  }

  private async notifyBidAwarded(bidRequestId: string, winningVendorId: string): Promise<void> {
    // TODO: Implement winner notification
    console.log(`Notifying vendor ${winningVendorId} of bid award for request ${bidRequestId}`);
  }

  private async notifyBidsRejected(bidRequestId: string, winningVendorId: string): Promise<void> {
    // TODO: Implement rejection notifications
    console.log(`Notifying rejected vendors for bid request ${bidRequestId} (winner: ${winningVendorId})`);
  }

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  /**
   * Generate secure token for vendor access
   */
  generateVendorToken(bidRequestId: string, vendorId: string): string {
    // TODO: Implement secure token generation
    return btoa(`${bidRequestId}:${vendorId}:${Date.now()}`);
  }

  /**
   * Validate vendor token
   */
  validateVendorToken(token: string): { bidRequestId: string; vendorId: string } | null {
    try {
      const decoded = atob(token);
      const [bidRequestId, vendorId, timestamp] = decoded.split(':');
      
      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return { bidRequestId, vendorId };
    } catch {
      return null;
    }
  }

  /**
   * Check if user has access to HOA
   */
  async checkHOAAccess(userId: string, hoaId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_hoa_access')
        .select('id')
        .eq('user_id', userId)
        .eq('hoa_id', hoaId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const bidRequestService = new BidRequestService();

// Export individual methods for tree shaking
export const {
  createBidRequest,
  getBidRequest,
  getBidRequests,
  updateBidRequestStatus,
  submitVendorBid,
  getVendorBids,
  selectWinningBid,
  getVendors,
  getVendorPerformance,
  upsertVendor,
  getProjectTypes,
  generateVendorToken,
  validateVendorToken,
  checkHOAAccess
} = bidRequestService;
