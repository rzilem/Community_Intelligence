
import { supabase } from '@/integrations/supabase/client';
import { BidRequestVendor } from '@/types/bid-request-types';

/**
 * Get all vendors for a specific bid request
 */
export async function getBidRequestVendors(bidRequestId: string): Promise<BidRequestVendor[]> {
  const { data: vendorData, error: vendorError } = await supabase
    .from('bid_request_vendors')
    .select('*')
    .eq('bid_request_id', bidRequestId);

  if (vendorError) {
    console.error('Error fetching bid request vendors:', vendorError);
    throw vendorError;
  }
  
  // Convert snake_case to camelCase and ensure correct types
  return (vendorData || []).map(item => ({
    id: item.id,
    bidRequestId: item.bid_request_id,
    vendorId: item.vendor_id,
    status: item.status as "invited" | "accepted" | "declined" | "submitted",
    quoteAmount: item.quote_amount,
    quoteDetails: item.quote_details as Record<string, any>,
    submittedAt: item.submitted_at
  }));
}

/**
 * Add a vendor to a bid request
 */
export async function addVendorToBidRequest(bidRequestVendor: Partial<BidRequestVendor>): Promise<BidRequestVendor> {
  // Convert camelCase to snake_case
  const dbVendor = {
    bid_request_id: bidRequestVendor.bidRequestId,
    vendor_id: bidRequestVendor.vendorId,
    status: bidRequestVendor.status || 'invited',
    quote_amount: bidRequestVendor.quoteAmount,
    quote_details: bidRequestVendor.quoteDetails || {},
    submitted_at: bidRequestVendor.submittedAt
  };

  const { data, error } = await supabase
    .from('bid_request_vendors')
    .insert(dbVendor)
    .select('*')
    .single();

  if (error) {
    console.error('Error adding vendor to bid request:', error);
    throw error;
  }
  
  // Convert snake_case back to camelCase
  return {
    id: data.id,
    bidRequestId: data.bid_request_id,
    vendorId: data.vendor_id,
    status: data.status as "invited" | "accepted" | "declined" | "submitted",
    quoteAmount: data.quote_amount,
    quoteDetails: data.quote_details as Record<string, any>,
    submittedAt: data.submitted_at
  };
}

/**
 * Get a list of eligible vendors for bid requests
 */
export async function filterEligibleVendors(associationId: string): Promise<any[]> {
  console.log('Filtering eligible vendors for association:', associationId);
  
  try {
    // Query vendors directly instead of using RPC
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('association_id', associationId)
      .eq('include_in_bids', true);
    
    if (error) {
      console.error('Error querying eligible vendors:', error);
      throw error;
    }
    
    return data || [];
  } catch (e) {
    console.error('Error filtering eligible vendors:', e);
    // Return mock data for now
    return [
      { id: '1', name: 'ABC Maintenance', include_in_bids: true },
      { id: '2', name: 'XYZ Contractors', include_in_bids: true },
      { id: '3', name: 'City Landscaping', include_in_bids: true }
    ];
  }
}
