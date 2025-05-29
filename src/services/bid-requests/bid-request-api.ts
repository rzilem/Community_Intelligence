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
    assigned_to: bidRequest.assigned_to, // Use snake_case property
    due_date: bidRequest.dueDate,
    budget: bidRequest.budget,
    category: bidRequest.category,
    visibility: bidRequest.visibility || 'private',
    image_url: bidRequest.imageUrl,
    attachments: bidRequest.attachments ? JSON.stringify(bidRequest.attachments) : null
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
    hoa_id: data.hoa_id || data.association_id,
    association_id: data.association_id,
    associationId: data.association_id,
    maintenance_request_id: data.maintenance_request_id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority as "low" | "medium" | "high" | "urgent",
    budget_range_min: data.budget_range_min,
    budget_range_max: data.budget_range_max,
    preferred_start_date: data.preferred_start_date,
    required_completion_date: data.required_completion_date,
    location: data.location,
    special_requirements: data.special_requirements,
    attachments: data.attachments ? JSON.parse(String(data.attachments)) : [],
    status: data.status as "draft" | "published" | "bidding" | "evaluating" | "awarded" | "completed" | "cancelled",
    bid_deadline: data.bid_deadline,
    selected_vendor_id: data.selected_vendor_id,
    awarded_amount: data.awarded_amount,
    awarded_at: data.awarded_at,
    created_by: data.created_by,
    createdBy: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    imageUrl: data.image_url,
    visibility: data.visibility as "private" | "association" | "public",
    due_date: data.due_date,
    dueDate: data.due_date,
    budget: data.budget
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
    assigned_to: bidRequest.assigned_to, // Use snake_case property
    due_date: bidRequest.dueDate,
    budget: bidRequest.budget,
    category: bidRequest.category,
    visibility: bidRequest.visibility,
    image_url: bidRequest.imageUrl,
    attachments: bidRequest.attachments ? JSON.stringify(bidRequest.attachments) : null
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
    hoa_id: data.hoa_id || data.association_id,
    association_id: data.association_id,
    associationId: data.association_id,
    maintenance_request_id: data.maintenance_request_id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority as "low" | "medium" | "high" | "urgent",
    budget_range_min: data.budget_range_min,
    budget_range_max: data.budget_range_max,
    preferred_start_date: data.preferred_start_date,
    required_completion_date: data.required_completion_date,
    location: data.location,
    special_requirements: data.special_requirements,
    attachments: data.attachments ? JSON.parse(String(data.attachments)) : [],
    status: data.status as "draft" | "published" | "bidding" | "evaluating" | "awarded" | "completed" | "cancelled",
    bid_deadline: data.bid_deadline,
    selected_vendor_id: data.selected_vendor_id,
    awarded_amount: data.awarded_amount,
    awarded_at: data.awarded_at,
    created_by: data.created_by,
    createdBy: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    imageUrl: data.image_url,
    visibility: data.visibility as "private" | "association" | "public",
    due_date: data.due_date,
    dueDate: data.due_date,
    budget: data.budget
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
    hoa_id: item.hoa_id || item.association_id,
    association_id: item.association_id,
    associationId: item.association_id,
    maintenance_request_id: item.maintenance_request_id,
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority as "low" | "medium" | "high" | "urgent",
    budget_range_min: item.budget_range_min,
    budget_range_max: item.budget_range_max,
    preferred_start_date: item.preferred_start_date,
    required_completion_date: item.required_completion_date,
    location: item.location,
    special_requirements: item.special_requirements,
    attachments: item.attachments ? JSON.parse(String(item.attachments)) : [],
    status: item.status as "draft" | "published" | "bidding" | "evaluating" | "awarded" | "completed" | "cancelled",
    bid_deadline: item.bid_deadline,
    selected_vendor_id: item.selected_vendor_id,
    awarded_amount: item.awarded_amount,
    awarded_at: item.awarded_at,
    created_by: item.created_by,
    createdBy: item.created_by,
    created_at: item.created_at,
    updated_at: item.updated_at,
    imageUrl: item.image_url,
    visibility: item.visibility as "private" | "association" | "public",
    due_date: item.due_date,
    dueDate: item.due_date,
    budget: item.budget,
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
    hoa_id: requestData.hoa_id || requestData.association_id,
    association_id: requestData.association_id,
    associationId: requestData.association_id,
    maintenance_request_id: requestData.maintenance_request_id,
    title: requestData.title,
    description: requestData.description,
    category: requestData.category,
    priority: requestData.priority as "low" | "medium" | "high" | "urgent",
    budget_range_min: requestData.budget_range_min,
    budget_range_max: requestData.budget_range_max,
    preferred_start_date: requestData.preferred_start_date,
    required_completion_date: requestData.required_completion_date,
    location: requestData.location,
    special_requirements: requestData.special_requirements,
    attachments: requestData.attachments ? JSON.parse(String(requestData.attachments)) : [],
    status: requestData.status as "draft" | "published" | "bidding" | "evaluating" | "awarded" | "completed" | "cancelled",
    bid_deadline: requestData.bid_deadline,
    selected_vendor_id: requestData.selected_vendor_id,
    awarded_amount: requestData.awarded_amount,
    awarded_at: requestData.awarded_at,
    created_by: requestData.created_by,
    createdBy: requestData.created_by,
    created_at: requestData.created_at,
    updated_at: requestData.updated_at,
    imageUrl: requestData.image_url,
    visibility: requestData.visibility as "private" | "association" | "public",
    due_date: requestData.due_date,
    dueDate: requestData.due_date,
    budget: requestData.budget,
    vendors
  };
}
