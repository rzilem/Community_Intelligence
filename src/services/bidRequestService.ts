
import { supabase } from '@/integrations/supabase/client';
import { BidRequestWithVendors, BidRequest, Vendor } from '@/types/bid-request-types';

export const bidRequestService = {
  async createBidRequest(data: Partial<BidRequestWithVendors>): Promise<BidRequest> {
    const { data: bidRequest, error } = await supabase
      .from('bid_requests')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        budget_range_min: data.budget_range_min,
        budget_range_max: data.budget_range_max,
        location: data.location,
        preferred_start_date: data.preferred_start_date,
        required_completion_date: data.required_completion_date,
        special_requirements: data.special_requirements,
        association_id: data.associationId,
        status: 'draft',
        priority: data.priority || 'medium'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bid request: ${error.message}`);
    }

    // If vendors are specified, invite them
    if (data.vendors && data.vendors.length > 0) {
      const vendorInvites = data.vendors.map(vendor => ({
        bid_request_id: bidRequest.id,
        vendor_id: vendor.vendorId,
        status: 'invited'
      }));

      const { error: vendorError } = await supabase
        .from('bid_request_vendors')
        .insert(vendorInvites);

      if (vendorError) {
        console.error('Failed to invite vendors:', vendorError);
      }
    }

    return {
      ...bidRequest,
      associationId: bidRequest.association_id,
      createdBy: bidRequest.created_by,
      hoa_id: bidRequest.association_id,
      priority: (bidRequest.priority || 'medium') as "low" | "medium" | "high" | "urgent",
      attachments: Array.isArray(bidRequest.attachments) ? bidRequest.attachments : []
    };
  },

  async filterEligibleVendors(associationId: string): Promise<Vendor[]> {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    // Transform database vendors to match the expected interface
    return vendors.map(vendor => ({
      id: vendor.id,
      hoa_id: associationId,
      association_id: associationId,
      name: vendor.name,
      contact_person: vendor.contact_person,
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      license_number: vendor.license_number || '',
      insurance_info: typeof vendor.insurance_info === 'object' && vendor.insurance_info !== null 
        ? vendor.insurance_info as any 
        : {},
      specialties: vendor.specialties || [],
      category: vendor.category || '',
      rating: vendor.rating || undefined,
      total_jobs: vendor.total_jobs || 0,
      completed_jobs: vendor.completed_jobs || 0,
      average_response_time: vendor.average_response_time || undefined,
      is_active: vendor.is_active || true,
      include_in_bids: true,
      notes: vendor.notes || '',
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }));
  },

  async getBidRequests(associationId: string): Promise<BidRequest[]> {
    const { data, error } = await supabase
      .from('bid_requests')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bid requests: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      associationId: item.association_id,
      createdBy: item.created_by,
      hoa_id: item.association_id,
      priority: (item.priority || 'medium') as "low" | "medium" | "high" | "urgent",
      attachments: Array.isArray(item.attachments) ? item.attachments : []
    }));
  }
};
