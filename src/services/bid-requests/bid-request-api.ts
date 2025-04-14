
import { supabase } from '@/integrations/supabase/client';
import { BidRequest, BidRequestWithVendors } from '@/types/bid-request-types';
import { getBidRequestVendors } from './bid-request-vendor-api';

/**
 * Create a new bid request
 */
export async function createBidRequest(bidRequest: Partial<BidRequest>): Promise<BidRequest> {
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
    status: data.status as "draft" | "open" | "closed" | "awarded",
    associationId: data.association_id,
    createdBy: data.created_by,
    assignedTo: data.assigned_to,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    budget: data.budget,
    category: data.category,
    visibility: data.visibility as "private" | "association" | "public",
    imageUrl: data.image_url,
    attachments: data.attachments as string[]
  };
}

/**
 * Update an existing bid request
 */
export async function updateBidRequest(id: string, bidRequest: Partial<BidRequest>): Promise<BidRequest> {
  // Convert camelCase fields to snake_case for database
  const dbBidRequest = {
    title: bidRequest.title,
    description: bidRequest.description,
    status: bidRequest.status,
    association_id: bidRequest.associationId,
    assigned_to: bidRequest.assignedTo,
    due_date: bidRequest.dueDate,
    budget: bidRequest.budget,
    category: bidRequest.category,
    visibility: bidRequest.visibility,
    image_url: bidRequest.imageUrl,
    attachments: bidRequest.attachments
  };

  // Remove undefined fields to not overwrite with nulls
  Object.keys(dbBidRequest).forEach(key => {
    if (dbBidRequest[key] === undefined) {
      delete dbBidRequest[key];
    }
  });

  console.log(`Updating bid request ${id} with data:`, dbBidRequest);

  const { data, error } = await supabase
    .from('bid_requests')
    .update(dbBidRequest)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating bid request:', error);
    throw error;
  }
  
  // Convert snake_case back to camelCase for frontend
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as "draft" | "open" | "closed" | "awarded",
    associationId: data.association_id,
    createdBy: data.created_by,
    assignedTo: data.assigned_to,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    budget: data.budget,
    category: data.category,
    visibility: data.visibility as "private" | "association" | "public",
    imageUrl: data.image_url,
    attachments: data.attachments as string[]
  };
}

/**
 * Get all bid requests for an association
 */
export async function getBidRequests(associationId: string): Promise<BidRequestWithVendors[]> {
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
    status: item.status as "draft" | "open" | "closed" | "awarded",
    associationId: item.association_id,
    createdBy: item.created_by,
    assignedTo: item.assigned_to,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: item.due_date,
    budget: item.budget,
    category: item.category,
    visibility: item.visibility as "private" | "association" | "public",
    imageUrl: item.image_url,
    attachments: item.attachments as string[],
    vendors: []
  }));
}

/**
 * Get a single bid request by ID with its related vendors
 */
export async function getBidRequestById(id: string): Promise<BidRequestWithVendors> {
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
  const vendors = await getBidRequestVendors(id);
  
  // Convert snake_case to camelCase and ensure correct types
  return {
    id: requestData.id,
    title: requestData.title,
    description: requestData.description,
    status: requestData.status as "draft" | "open" | "closed" | "awarded",
    associationId: requestData.association_id,
    createdBy: requestData.created_by,
    assignedTo: requestData.assigned_to,
    createdAt: requestData.created_at,
    updatedAt: requestData.updated_at,
    dueDate: requestData.due_date,
    budget: requestData.budget,
    category: requestData.category,
    visibility: requestData.visibility as "private" | "association" | "public",
    imageUrl: requestData.image_url,
    attachments: requestData.attachments as string[],
    vendors
  };
}
