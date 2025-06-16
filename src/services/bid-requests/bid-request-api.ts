
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestWithVendors } from '@/types/bid-request-types';

export async function createBidRequest(bidRequestData: Partial<BidRequest>): Promise<BidRequest> {
  console.log('=== API: Creating bid request ===');
  console.log('Data being sent to Supabase:', bidRequestData);

  const { data, error } = await supabase
    .from('bid_requests')
    .insert(bidRequestData as any)
    .select()
    .single();

  if (error) {
    console.error('=== SUPABASE ERROR ===');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    throw new Error(error.message);
  }

  console.log('=== API: Bid request created successfully ===');
  console.log('Returned data:', data);
  return data as BidRequest;
}

export async function getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
  console.log('=== API: Fetching bid requests for association ===', associationId);
  
  const { data, error } = await supabase
    .from('bid_requests')
    .select(`
      *,
      vendors:bid_request_vendors(
        id,
        vendor_id,
        status,
        quote_amount,
        bid_request_id,
        created_at,
        updated_at
      )
    `)
    .eq('association_id', associationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bid requests:', error);
    throw new Error(error.message);
  }

  console.log('Fetched bid requests:', data);
  return (data || []) as BidRequestWithVendors[];
}

export async function updateBidRequest(id: string, updates: Partial<BidRequest>): Promise<BidRequest> {
  const { data, error } = await supabase
    .from('bid_requests')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bid request:', error);
    throw new Error(error.message);
  }

  return data as BidRequest;
}

export async function deleteBidRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('bid_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bid request:', error);
    throw new Error(error.message);
  }
}
