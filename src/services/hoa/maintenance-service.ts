
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceRequest } from '@/types/app-types';
import { toast } from 'sonner';

export const fetchMaintenanceRequestsByProperty = async (propertyId: string): Promise<MaintenanceRequest[]> => {
  const { data, error } = await supabase
    .from('maintenance_requests' as any)
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error(`Error fetching maintenance requests: ${error.message}`);
    throw new Error(`Error fetching maintenance requests: ${error.message}`);
  }

  return (data as any[]).map(request => ({
    id: request.id,
    property_id: request.property_id,
    association_id: "placeholder-association-id", // Required by type but not in DB
    title: request.title,
    description: request.description,
    status: request.status,
    assigned_to: request.assigned_to,
    priority: request.priority,
    resolved_date: request.resolved_date,
    created_at: request.created_at,
    updated_at: request.updated_at
  }));
};

export const fetchMaintenanceRequestById = async (id: string): Promise<MaintenanceRequest> => {
  const { data, error } = await supabase
    .from('maintenance_requests' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    toast.error(`Error fetching maintenance request: ${error.message}`);
    throw new Error(`Error fetching maintenance request: ${error.message}`);
  }

  const request = data as any;
  
  return {
    id: request.id,
    property_id: request.property_id,
    association_id: "placeholder-association-id", // Required by type but not in DB
    title: request.title,
    description: request.description,
    status: request.status,
    assigned_to: request.assigned_to,
    priority: request.priority,
    resolved_date: request.resolved_date,
    created_at: request.created_at,
    updated_at: request.updated_at
  };
};

export const createMaintenanceRequest = async (request: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
  // Create a new object with only the fields that exist in the database
  const dbRequest = {
    property_id: request.property_id,
    title: request.title,
    description: request.description,
    status: request.status,
    assigned_to: request.assigned_to,
    priority: request.priority
  };

  const { data, error } = await supabase
    .from('maintenance_requests' as any)
    .insert(dbRequest as any)
    .select()
    .single();

  if (error) {
    toast.error(`Error creating maintenance request: ${error.message}`);
    throw new Error(`Error creating maintenance request: ${error.message}`);
  }

  toast.success('Maintenance request created successfully');
  const newRequest = data as any;
  
  return {
    id: newRequest.id,
    property_id: newRequest.property_id,
    association_id: "placeholder-association-id", // Required by type but not in DB
    title: newRequest.title,
    description: newRequest.description,
    status: newRequest.status,
    assigned_to: newRequest.assigned_to,
    priority: newRequest.priority,
    resolved_date: newRequest.resolved_date,
    created_at: newRequest.created_at,
    updated_at: newRequest.updated_at
  };
};

export const updateMaintenanceRequest = async (id: string, request: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
  // Create a new object with only the fields that exist in the database
  const dbRequest = {
    property_id: request.property_id,
    title: request.title,
    description: request.description,
    status: request.status,
    assigned_to: request.assigned_to,
    priority: request.priority,
    resolved_date: request.resolved_date
  };

  const { data, error } = await supabase
    .from('maintenance_requests' as any)
    .update(dbRequest as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast.error(`Error updating maintenance request: ${error.message}`);
    throw new Error(`Error updating maintenance request: ${error.message}`);
  }

  toast.success('Maintenance request updated successfully');
  const updatedRequest = data as any;
  
  return {
    id: updatedRequest.id,
    property_id: updatedRequest.property_id,
    association_id: "placeholder-association-id", // Required by type but not in DB
    title: updatedRequest.title,
    description: updatedRequest.description,
    status: updatedRequest.status,
    assigned_to: updatedRequest.assigned_to,
    priority: updatedRequest.priority,
    resolved_date: updatedRequest.resolved_date,
    created_at: updatedRequest.created_at,
    updated_at: updatedRequest.updated_at
  };
};

export const deleteMaintenanceRequest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('maintenance_requests' as any)
    .delete()
    .eq('id', id);

  if (error) {
    toast.error(`Error deleting maintenance request: ${error.message}`);
    throw new Error(`Error deleting maintenance request: ${error.message}`);
  }

  toast.success('Maintenance request deleted successfully');
};
