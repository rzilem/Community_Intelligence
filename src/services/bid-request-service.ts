
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';

export const bidRequestService = {
  async createBidRequest(bidRequest: Partial<BidRequest>): Promise<BidRequest> {
    // Convert camelCase fields to snake_case for database
    const dbBidRequest = {
      title: bidRequest.title,
      description: bidRequest.description,
      status: bidRequest.status,
      association_id: bidRequest.associationId,
      created_by: bidRequest.createdBy,
      assigned_to: bidRequest.assignedTo,
      due_date: bidRequest.dueDate,
      budget: bidRequest.budget,
      category: bidRequest.category,
      visibility: bidRequest.visibility,
      image_url: bidRequest.imageUrl,
      attachments: bidRequest.attachments
    };

    const { data, error } = await supabase
      .from('bid_requests')
      .insert(dbBidRequest)
      .select()
      .single();

    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      associationId: data.association_id,
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date,
      budget: data.budget,
      category: data.category,
      visibility: data.visibility,
      imageUrl: data.image_url,
      attachments: data.attachments
    };
  },

  async getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
    const { data, error } = await supabase
      .from('bid_requests')
      .select(`
        id,
        title,
        description,
        status,
        association_id,
        created_by,
        assigned_to,
        created_at,
        updated_at,
        due_date,
        budget,
        category,
        visibility,
        image_url,
        attachments
      `)
      .eq('association_id', associationId);

    if (error) throw error;
    
    // Convert snake_case to camelCase
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      associationId: item.association_id,
      createdBy: item.created_by,
      assignedTo: item.assigned_to,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      dueDate: item.due_date,
      budget: item.budget,
      category: item.category,
      visibility: item.visibility,
      imageUrl: item.image_url,
      attachments: item.attachments,
      vendors: []
    }));
  },

  async getBidRequestById(id: string): Promise<BidRequestWithVendors> {
    const { data, error } = await supabase
      .from('bid_requests')
      .select(`
        id,
        title,
        description,
        status,
        association_id,
        created_by,
        assigned_to,
        created_at,
        updated_at,
        due_date,
        budget,
        category,
        visibility,
        image_url,
        attachments
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Get vendors for this bid request
    const { data: vendorData, error: vendorError } = await supabase
      .from('bid_request_vendors')
      .select(`
        id,
        bid_request_id,
        vendor_id,
        status,
        quote_amount,
        quote_details,
        submitted_at
      `)
      .eq('bid_request_id', id);

    if (vendorError) throw vendorError;
    
    // Convert snake_case to camelCase
    const vendors = vendorData.map(item => ({
      id: item.id,
      bidRequestId: item.bid_request_id,
      vendorId: item.vendor_id,
      status: item.status,
      quoteAmount: item.quote_amount,
      quoteDetails: item.quote_details,
      submittedAt: item.submitted_at
    }));

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      associationId: data.association_id,
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dueDate: data.due_date,
      budget: data.budget,
      category: data.category,
      visibility: data.visibility,
      imageUrl: data.image_url,
      attachments: data.attachments,
      vendors
    };
  },

  async addVendorToBidRequest(bidRequestVendor: Partial<BidRequestVendor>): Promise<BidRequestVendor> {
    // Convert camelCase to snake_case
    const dbVendor = {
      bid_request_id: bidRequestVendor.bidRequestId,
      vendor_id: bidRequestVendor.vendorId,
      status: bidRequestVendor.status,
      quote_amount: bidRequestVendor.quoteAmount,
      quote_details: bidRequestVendor.quoteDetails,
      submitted_at: bidRequestVendor.submittedAt
    };

    const { data, error } = await supabase
      .from('bid_request_vendors')
      .insert(dbVendor)
      .select()
      .single();

    if (error) throw error;
    
    // Convert snake_case back to camelCase
    return {
      id: data.id,
      bidRequestId: data.bid_request_id,
      vendorId: data.vendor_id,
      status: data.status,
      quoteAmount: data.quote_amount,
      quoteDetails: data.quote_details,
      submittedAt: data.submitted_at
    };
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
