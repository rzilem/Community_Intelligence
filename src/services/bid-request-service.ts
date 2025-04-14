
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';

export const bidRequestService = {
  async createBidRequest(bidRequest: Partial<BidRequest>): Promise<BidRequest> {
    const { data, error } = await supabase
      .from('bid_requests')
      .insert(bidRequest)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
    const { data, error } = await supabase
      .from('bid_requests')
      .select(`
        *,
        bid_request_vendors (
          *,
          vendor:vendors (*)
        )
      `)
      .eq('association_id', associationId);

    if (error) throw error;
    return data as BidRequestWithVendors[];
  },

  async getBidRequestById(id: string): Promise<BidRequestWithVendors> {
    const { data, error } = await supabase
      .from('bid_requests')
      .select(`
        *,
        bid_request_vendors (
          *,
          vendor:vendors (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addVendorToBidRequest(bidRequestVendor: Partial<BidRequestVendor>): Promise<BidRequestVendor> {
    const { data, error } = await supabase
      .from('bid_request_vendors')
      .insert(bidRequestVendor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadBidRequestImage(file: File, bidRequestId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bidRequestId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bid-request-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('bid-request-files')
      .getPublicUrl(filePath);

    // Update bid request with image URL
    await supabase
      .from('bid_requests')
      .update({ image_url: publicUrl })
      .eq('id', bidRequestId);

    return publicUrl;
  },

  async filterEligibleVendors(associationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('include_in_bids', true);

    if (error) throw error;
    return data;
  }
};
