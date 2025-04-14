
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

    // Use the rpc function to execute raw SQL instead of the typed client
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          INSERT INTO bid_requests (
            title, description, status, association_id, created_by, assigned_to, 
            due_date, budget, category, visibility, image_url, attachments
          ) 
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          )
          RETURNING *
        `,
        params: [
          dbBidRequest.title,
          dbBidRequest.description,
          dbBidRequest.status,
          dbBidRequest.association_id,
          dbBidRequest.created_by,
          dbBidRequest.assigned_to,
          dbBidRequest.due_date,
          dbBidRequest.budget,
          dbBidRequest.category,
          dbBidRequest.visibility,
          dbBidRequest.image_url,
          JSON.stringify(dbBidRequest.attachments)
        ]
      });

    if (error) {
      console.error('Error creating bid request:', error);
      throw error;
    }
    
    // When using rpc, data will be an array of rows
    const result = Array.isArray(data) ? data[0] : data;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      status: result.status,
      associationId: result.association_id,
      createdBy: result.created_by,
      assignedTo: result.assigned_to,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      dueDate: result.due_date,
      budget: result.budget,
      category: result.category,
      visibility: result.visibility,
      imageUrl: result.image_url,
      attachments: result.attachments
    };
  },

  async getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
    console.log('Fetching bid requests for association:', associationId);
    
    // Use the rpc function to execute raw SQL
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          SELECT 
            id, title, description, status, association_id, created_by, assigned_to,
            created_at, updated_at, due_date, budget, category, visibility,
            image_url, attachments
          FROM bid_requests
          WHERE association_id = $1
        `,
        params: [associationId]
      });

    if (error) {
      console.error('Error fetching bid requests:', error);
      throw error;
    }
    
    console.log('Fetched bid requests:', data);
    
    // Convert snake_case to camelCase
    return (Array.isArray(data) ? data : []).map(item => ({
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
    // Use the rpc function to execute raw SQL
    const { data: requestData, error: requestError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          SELECT 
            id, title, description, status, association_id, created_by, assigned_to,
            created_at, updated_at, due_date, budget, category, visibility,
            image_url, attachments
          FROM bid_requests
          WHERE id = $1
        `,
        params: [id]
      });

    if (requestError) {
      console.error('Error fetching bid request by ID:', requestError);
      throw requestError;
    }
    
    const bidRequestRow = Array.isArray(requestData) && requestData.length > 0 
      ? requestData[0] 
      : null;
      
    if (!bidRequestRow) {
      throw new Error(`Bid request with ID ${id} not found`);
    }
    
    // Get vendors for this bid request
    const { data: vendorData, error: vendorError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          SELECT 
            id, bid_request_id, vendor_id, status, quote_amount,
            quote_details, submitted_at
          FROM bid_request_vendors
          WHERE bid_request_id = $1
        `,
        params: [id]
      });

    if (vendorError) {
      console.error('Error fetching bid request vendors:', vendorError);
      throw vendorError;
    }
    
    // Convert snake_case to camelCase
    const vendors = Array.isArray(vendorData) 
      ? vendorData.map(item => ({
          id: item.id,
          bidRequestId: item.bid_request_id,
          vendorId: item.vendor_id,
          status: item.status,
          quoteAmount: item.quote_amount,
          quoteDetails: item.quote_details,
          submittedAt: item.submitted_at
        }))
      : [];

    return {
      id: bidRequestRow.id,
      title: bidRequestRow.title,
      description: bidRequestRow.description,
      status: bidRequestRow.status,
      associationId: bidRequestRow.association_id,
      createdBy: bidRequestRow.created_by,
      assignedTo: bidRequestRow.assigned_to,
      createdAt: bidRequestRow.created_at,
      updatedAt: bidRequestRow.updated_at,
      dueDate: bidRequestRow.due_date,
      budget: bidRequestRow.budget,
      category: bidRequestRow.category,
      visibility: bidRequestRow.visibility,
      imageUrl: bidRequestRow.image_url,
      attachments: bidRequestRow.attachments,
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
      quote_details: bidRequestVendor.quoteDetails,
      submitted_at: bidRequestVendor.submittedAt
    };

    // Use the rpc function to execute raw SQL
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          INSERT INTO bid_request_vendors (
            bid_request_id, vendor_id, status, quote_amount, quote_details, submitted_at
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        params: [
          dbVendor.bid_request_id,
          dbVendor.vendor_id,
          dbVendor.status,
          dbVendor.quote_amount,
          JSON.stringify(dbVendor.quote_details || {}),
          dbVendor.submitted_at
        ]
      });

    if (error) {
      console.error('Error adding vendor to bid request:', error);
      throw error;
    }
    
    const result = Array.isArray(data) && data.length > 0 ? data[0] : null;
    
    if (!result) {
      throw new Error('Failed to insert bid request vendor');
    }
    
    // Convert snake_case back to camelCase
    return {
      id: result.id,
      bidRequestId: result.bid_request_id,
      vendorId: result.vendor_id,
      status: result.status,
      quoteAmount: result.quote_amount,
      quoteDetails: result.quote_details,
      submittedAt: result.submitted_at
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

    // Update bid request with image URL using rpc
    await supabase
      .rpc('execute_sql', {
        sql_query: `
          UPDATE bid_requests
          SET image_url = $1
          WHERE id = $2
        `,
        params: [publicUrl, bidRequestId]
      });

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
