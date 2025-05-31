
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
        budget_range_min: data.budgetRangeMin,
        budget_range_max: data.budgetRangeMax,
        location: data.location,
        preferred_start_date: data.preferredStartDate,
        required_completion_date: data.requiredCompletionDate,
        special_requirements: data.specialRequirements,
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

    return bidRequest;
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
      name: vendor.name,
      email: vendor.email || '',
      phone: vendor.phone || '',
      category: vendor.category || '',
      status: vendor.status as 'active' | 'inactive',
      hasInsurance: vendor.has_insurance || false,
      rating: vendor.rating || undefined,
      lastInvoice: vendor.last_invoice || undefined,
      contactPerson: vendor.contact_person || undefined
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

    return data || [];
  }
};
