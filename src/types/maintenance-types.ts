
// Maintenance related types
export type MaintenanceRequest = {
  id: string;
  property_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  resolved_date?: string;
  created_at?: string;
  updated_at?: string;
};
