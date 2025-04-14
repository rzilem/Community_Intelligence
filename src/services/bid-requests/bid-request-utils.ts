
/**
 * Utility functions for bid requests
 */

/**
 * Convert a database bid request to the frontend format
 */
export function mapDbBidRequestToModel(dbBidRequest: any): any {
  return {
    id: dbBidRequest.id,
    title: dbBidRequest.title,
    description: dbBidRequest.description,
    status: dbBidRequest.status as "draft" | "open" | "closed" | "awarded",
    associationId: dbBidRequest.association_id,
    createdBy: dbBidRequest.created_by,
    assignedTo: dbBidRequest.assigned_to,
    createdAt: dbBidRequest.created_at,
    updatedAt: dbBidRequest.updated_at,
    dueDate: dbBidRequest.due_date,
    budget: dbBidRequest.budget,
    category: dbBidRequest.category,
    visibility: dbBidRequest.visibility as "private" | "association" | "public",
    imageUrl: dbBidRequest.image_url,
    attachments: dbBidRequest.attachments as string[]
  };
}

/**
 * Convert a model bid request to the database format
 */
export function mapModelBidRequestToDb(bidRequest: any): any {
  return {
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
}
