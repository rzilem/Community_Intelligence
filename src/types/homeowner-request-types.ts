
export type HomeownerRequestStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type HomeownerRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HomeownerRequestType = 'maintenance' | 'compliance' | 'billing' | 'general' | 'amenity';

export interface HomeownerRequest {
  id: string;
  title: string;
  description: string;
  status: HomeownerRequestStatus;
  priority: HomeownerRequestPriority;
  type: HomeownerRequestType;
  createdAt: string;
  updatedAt: string;
  residentId: string;
  propertyId: string;
  associationId: string;
  assignedTo?: string;
  resolvedAt?: string;
}
