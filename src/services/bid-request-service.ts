
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';

export const bidRequestService = {
  async createBidRequest(bidRequest: Partial<BidRequest>): Promise<BidRequest> {
    // Convert camelCase fields to snake_case for database
    const dbBidRequest = {
      title: bidRequest.title,
      description: bidRequest.description,
      status: bidRequest.status || 'draft',
      association_id: bidRequest.associationId,
      created_by: bidRequest.createdBy,
      assigned_to: bidRequest.assignedTo,
      due_date: bidRequest.dueDate,
      budget: bidRequest.budget,
      category: bidRequest.category,
      visibility: bidRequest.visibility || 'private',
      image_url: bidRequest.imageUrl,
      attachments: bidRequest.attachments || []
    };

    console.log('Creating bid request with data:', dbBidRequest);

    const { data, error } = await supabase
      .from('bid_requests')
      .insert(dbBidRequest)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating bid request:', error);
      throw error;
    }
    
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
    console.log('Fetching bid requests for association:', associationId);
    
    const { data, error } = await supabase
      .from('bid_requests')
      .select('*')
      .eq('association_id', associationId);

    if (error) {
      console.error('Error fetching bid requests:', error);
      throw error;
    }
    
    console.log('Fetched bid requests:', data);
    
    // Convert snake_case to camelCase
    return (data || []).map(item => ({
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
    // Fetch bid request
    const { data: requestData, error: requestError } = await supabase
      .from('bid_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError) {
      console.error('Error fetching bid request by ID:', requestError);
      throw requestError;
    }
    
    // Get vendors for this bid request
    const { data: vendorData, error: vendorError } = await supabase
      .from('bid_request_vendors')
      .select('*')
      .eq('bid_request_id', id);

    if (vendorError) {
      console.error('Error fetching bid request vendors:', vendorError);
      throw vendorError;
    }
    
    // Convert snake_case to camelCase
    const vendors = (vendorData || []).map(item => ({
      id: item.id,
      bidRequestId: item.bid_request_id,
      vendorId: item.vendor_id,
      status: item.status,
      quoteAmount: item.quote_amount,
      quoteDetails: item.quote_details,
      submittedAt: item.submitted_at
    }));

    return {
      id: requestData.id,
      title: requestData.title,
      description: requestData.description,
      status: requestData.status,
      associationId: requestData.association_id,
      createdBy: requestData.created_by,
      assignedTo: requestData.assigned_to,
      createdAt: requestData.created_at,
      updatedAt: requestData.updated_at,
      dueDate: requestData.due_date,
      budget: requestData.budget,
      category: requestData.category,
      visibility: requestData.visibility,
      imageUrl: requestData.image_url,
      attachments: requestData.attachments,
      vendors
    };
  },

  async addVendorToBidRequest(bidRequestVendor: Partial<BidRequestVendor>): Promise<BidRequestVendor> {
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

    console.log('Uploading file:', file.name, 'to path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('bid-request-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading bid request image:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bid-request-files')
      .getPublicUrl(filePath);

    console.log('File uploaded, public URL:', publicUrl);

    // Update bid request with image URL
    const { error: updateError } = await supabase
      .from('bid_requests')
      .update({ image_url: publicUrl })
      .eq('id', bidRequestId);

    if (updateError) {
      console.error('Error updating bid request with image URL:', updateError);
      throw updateError;
    }

    return publicUrl;
  },

  async filterEligibleVendors(associationId: string): Promise<any[]> {
    console.log('Filtering eligible vendors for association:', associationId);
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('include_in_bids', true);

    if (error) {
      console.error('Error filtering eligible vendors:', error);
      throw error;
    }
    
    console.log('Filtered eligible vendors:', data);
    return data;
  }
};
